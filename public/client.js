// client.js
const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const peerConnection = new RTCPeerConnection({
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
});

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    });

peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
};

peerConnection.onicecandidate = event => {
    if (event.candidate) {
        socket.emit('candidate', { candidate: event.candidate });
    }
};

socket.on('call', async peerId => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', { peerId, offer });
});

socket.on('offer', async offer => {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', { answer });
});

socket.on('answer', answer => {
    peerConnection.setRemoteDescription(answer);
});

socket.on('candidate', candidate => {
    peerConnection.addIceCandidate(candidate);
});