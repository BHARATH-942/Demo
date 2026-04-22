import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { Camera, Save, AlertCircle } from 'lucide-react';

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const FaceSetup = () => {
    const videoRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState('Loading models...');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                setStatus('Models loaded. Please allow camera access.');
                startVideo();
            } catch (err) {
                console.error(err);
                setStatus('Error loading face-api models. Internet connection required.');
            }
        };

        loadModels();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                setStatus('Camera active. Keep your face steady.');
            })
            .catch((err) => {
                console.error("Camera error", err);
                setStatus('Camera access denied or unavailable.');
            });
    };

    const captureAndSave = async () => {
        if (!modelsLoaded || !videoRef.current) return;
        setIsSaving(true);
        setStatus('Detecting face...');

        const detections = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();

        if (detections) {
            setStatus('Face detected. Saving descriptor...');
            // descriptor is a Float32Array, convert to simple array to send via JSON
            const descriptorArray = Array.from(detections.descriptor);

            try {
                await axios.post('/users/face', { faceDescriptor: descriptorArray });
                setStatus('Face ID saved successfully!');

                // Stop camera
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            } catch (err) {
                console.error(err);
                setStatus('Failed to save on server.');
            }

        } else {
            setStatus('No face detected. Try moving closer or improving lighting.');
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Setup Face ID</h1>
            <p className="text-gray-600 mb-8">Register your face to enable secure, biometric attendance marking.</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">

                <div className={`mb-6 p-4 rounded-lg w-full flex items-center space-x-3 ${status.includes('success') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    <AlertCircle size={20} />
                    <span className="font-medium">{status}</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-inner w-full max-w-lg aspect-video mb-8 border border-gray-800">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                    />
                    {!modelsLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50">
                            Loading camera...
                        </div>
                    )}
                </div>

                <button
                    onClick={captureAndSave}
                    disabled={!modelsLoaded || isSaving || status.includes('success')}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-md transition disabled:opacity-50"
                >
                    <Camera size={20} />
                    <span>{isSaving ? 'Processing...' : 'Capture & Save'}</span>
                </button>
            </div>
        </div>
    );
};

export default FaceSetup;
