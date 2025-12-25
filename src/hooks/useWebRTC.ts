import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useWebRTC = (conversationId: string | undefined, userId: string | undefined, options: { isVideo?: boolean } = {}) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [peers, setPeers] = useState<string[]>([]);


    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const { toast } = useToast();


    const cleanup = useCallback(() => {


        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        peerConnections.current.forEach((pc) => pc.close());
        peerConnections.current.clear();

        if (channelRef.current) {

            channelRef.current.unsubscribe();
            channelRef.current = null;
        }

        setLocalStream(null);
        setRemoteStreams(new Map());
        setPeers([]);
    }, []);


    const createPeerConnection = useCallback(async (targetUserId: string, initiator: boolean) => {
        if (peerConnections.current.has(targetUserId)) {
            return peerConnections.current.get(targetUserId);
        }



        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });


        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }


        pc.onicecandidate = (event) => {
            if (event.candidate && channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'candidate',
                    payload: {
                        candidate: event.candidate,
                        targetUserId: targetUserId,
                        fromUserId: userId
                    }
                });
            }
        };


        pc.ontrack = (event) => {

            setRemoteStreams(prev => {
                const newMap = new Map(prev);
                newMap.set(targetUserId, event.streams[0]);
                return newMap;
            });
        };

        pc.onconnectionstatechange = () => {

            if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                peerConnections.current.delete(targetUserId);
                setRemoteStreams(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(targetUserId);
                    return newMap;
                });
            }
        };

        peerConnections.current.set(targetUserId, pc);

        if (initiator && channelRef.current) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await channelRef.current.send({
                    type: 'broadcast',
                    event: 'offer',
                    payload: {
                        offer,
                        targetUserId,
                        fromUserId: userId
                    }
                });
            } catch (err) {
                console.error("Error creating offer:", err);
            }
        }

        return pc;
    }, [userId]);


    useEffect(() => {
        if (!conversationId || !userId) return;


        if (channelRef.current) channelRef.current.unsubscribe();

        const channel = supabase.channel(`signaling:${conversationId}`, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });
        channelRef.current = channel;

        const init = async () => {
            try {

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: options.isVideo ?? false
                });

                localStreamRef.current = stream;
                setLocalStream(stream);


                channel
                    .on('presence', { event: 'sync' }, async () => {
                        const state = channel.presenceState();

                        const onlineUsers = [];
                        for (const key in state) {
                            onlineUsers.push(...state[key]); // state[key] is array of presences
                        }

                        const currentPeerIds = onlineUsers
                            .map((u: any) => u.user_id || u.key) // Fallback if user_id missing, though we sent key
                            .filter(id => id && id !== userId);

                        const uniquePeers = [...new Set(currentPeerIds)];

                        setPeers(uniquePeers as string[]);


                        for (const peerId of uniquePeers as string[]) {
                            if (!peerConnections.current.has(peerId)) {
                                if (userId < peerId) {

                                    await createPeerConnection(peerId, true);
                                }
                            }
                        }
                    })
                    .on('presence', { event: 'join' }, ({ newPresences }) => {


                    })
                    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                        leftPresences.forEach((user: any) => {
                            const id = user.user_id || user.key; // Verify field
                            if (id) {

                                const pc = peerConnections.current.get(id);
                                if (pc) {
                                    pc.close();
                                    peerConnections.current.delete(id);
                                    setRemoteStreams(prev => {
                                        const m = new Map(prev);
                                        m.delete(id);
                                        return m;
                                    });
                                }
                            }
                        });
                    })
                    .on('broadcast', { event: 'offer' }, async ({ payload }) => {
                        if (payload.targetUserId !== userId) return;


                        const pc = await createPeerConnection(payload.fromUserId, false);
                        if (pc) {
                            if (pc.signalingState !== 'stable') {

                            }
                            await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);

                            channel.send({
                                type: 'broadcast',
                                event: 'answer',
                                payload: {
                                    answer,
                                    targetUserId: payload.fromUserId,
                                    fromUserId: userId
                                }
                            });
                        }
                    })
                    .on('broadcast', { event: 'answer' }, async ({ payload }) => {
                        if (payload.targetUserId !== userId) return;

                        const pc = peerConnections.current.get(payload.fromUserId);
                        if (pc) {
                            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                        }
                    })
                    .on('broadcast', { event: 'candidate' }, async ({ payload }) => {
                        if (payload.targetUserId !== userId) return;
                        const pc = peerConnections.current.get(payload.fromUserId);
                        if (pc) {
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                            } catch (e) {
                                console.error("ICE Error", e);
                            }
                        }
                    });

                // Subscribe
                channel.subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {

                        await channel.track({ user_id: userId, online_at: new Date().toISOString() });
                    }
                });

            } catch (err) {
                console.error("WebRTC Init Error:", err);
                toast({ title: "Error", description: "Failed to access media or connect.", variant: "destructive" });
            }
        };

        init();

        return () => cleanup();
    }, [conversationId, userId, createPeerConnection, cleanup, options.isVideo, toast]);


    const toggleMic = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
            return !localStreamRef.current.getAudioTracks()[0].enabled;
        }
        return false;
    }, []);

    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
            return !localStreamRef.current.getVideoTracks()[0].enabled;
        }
        return false;
    }, []);

    return {
        localStream,
        remoteStreams,
        peers,
        toggleMic,
        toggleVideo
    };
};
