import React, { useRef, useState, useEffect, useContext } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, KeyRound, CheckCircle2, AlertTriangle, ShieldAlert, Bluetooth, BluetoothSearching } from 'lucide-react';

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const MarkAttendance = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const videoRef = useRef();

    const [step, setStep] = useState(1); // 1: code, 2: bluetooth, 3: scan, 4: result
    const [sessionCode, setSessionCode] = useState('');
    const [classData, setClassData] = useState(null);
    const [status, setStatus] = useState('');

    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [baseDescriptor, setBaseDescriptor] = useState(null);
    const [location, setLocation] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    // Bluetooth state
    const [isBluetoothSupported, setIsBluetoothSupported] = useState(true);

    // Load models
    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
            } catch (err) {
                console.error(err);
                setStatus('Failed to load face models. Check connection.');
            }
        };
        loadModels();

        // Check Bluetooth Support
        if (!navigator.bluetooth) {
            setIsBluetoothSupported(false);
        }
    }, []);

    // Fetch Base Descriptor
    useEffect(() => {
        const fetchBaseFace = async () => {
            if (user) {
                try {
                    const userId = user._id || user.id;
                    const res = await axios.get(`/users/${userId}/face`);
                    if (res.data && res.data.length > 0) {
                        setBaseDescriptor(new Float32Array(res.data));
                    }
                } catch (err) {
                    console.error("No base face found", err);
                }
            }
        };
        fetchBaseFace();
    }, [user]);

    const verifyCode = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.get(`/classes/verify/${sessionCode}`);
            if (res.data.valid) {
                setClassData(res.data.class);
                setStep(2); // Proceed to Bluetooth step
                setStatus('');
            }
        } catch (err) {
            setStatus(err.response?.data?.msg || 'Invalid or inactive session code.');
        }
    };

    const handleBluetoothScan = async () => {
        if (!isBluetoothSupported) {
            setStatus('Web Bluetooth API is not supported in this browser. Please use Chrome/Edge.');
            return;
        }

        try {
            setStatus('Requesting Bluetooth device...');
            // In a real environment, the ESP32 broadcasts a specific name or service UUID.
            // Using name 'Classroom_101' as requested by user.
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ name: 'CLASSROOM_101' }],
                optionalServices: [] // Add service UUIDs here if needed later
            });

            if (device) {
                // Device found and selected by the user!
                setStatus('Bluetooth verified successfully!');
                setStep(3); // Proceed to Face Scan
                startVideo();
            }
        } catch (err) {
            console.error("Bluetooth error", err);
            setStatus('Failed to verify Bluetooth proximity. Ensure you are near the classroom beacon.');
        }
    };

    // Fallback for development if user doesn't have an ESP32 around:
    const bypassBluetoothForDev = () => {
        setStatus('Bypassing Bluetooth for Development...');
        setStep(3);
        startVideo();
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                videoRef.current.srcObject = stream;
            })
            .catch((err) => {
                console.error(err);
                setStatus('Camera access required.');
            });
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject("Geolocation not supported");
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (err) => reject(err),
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            }
        });
    };

    const handleMark = async () => {
        if (!baseDescriptor) {
            setStatus('Setup Face ID first from your dashboard.');
            return;
        }
        setIsValidating(true);
        setStatus('Validating location...');

        let currentLocation;
        try {
            currentLocation = await getLocation();
            setLocation(currentLocation);
        } catch (err) {
            setStatus('Failed to get location. Enable GPS.');
            setIsValidating(false);
            return;
        }

        setStatus('Detecting face...');
        const detections = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();

        if (!detections) {
            setStatus('No face detected. Please try again.');
            setIsValidating(false);
            return;
        }

        // Compare
        const distance = faceapi.euclideanDistance(detections.descriptor, baseDescriptor);
        if (distance > 0.55) {
            setStatus('Face mismatch! Distance: ' + distance.toFixed(2));
            setIsValidating(false);
            return;
        }

        setStatus('Face matched. Submitting attendance...');
        try {
            await axios.post('/attendance/mark', {
                sessionCode,
                location: currentLocation
            });
            stopVideo();
            setStep(4);
        } catch (err) {
            setStatus(err.response?.data?.msg || 'Attendance failed');
            setIsValidating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-white py-4 rounded-xl shadow-sm border border-gray-100">
                Mark Attendance
            </h1>

            {status && step !== 4 && (
                <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl flex items-center space-x-3 border border-yellow-200">
                    <AlertTriangle size={20} className="flex-shrink-0" />
                    <span className="font-medium">{status}</span>
                </div>
            )}

            {/* STEP 1: SESSION CODE */}
            {step === 1 && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-center mb-6 text-blue-600">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <KeyRound size={32} />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Enter Class Session Code</h2>
                    <form onSubmit={verifyCode} className="space-y-4">
                        <input
                            type="text"
                            required
                            placeholder="e.g. CS101-FALL"
                            value={sessionCode}
                            onChange={(e) => setSessionCode(e.target.value)}
                            className="w-full text-center text-2xl tracking-widest font-mono p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                        />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow">
                            Verify Code
                        </button>
                    </form>
                </div>
            )}

            {/* STEP 2: BLUETOOTH BEACON SCAN */}
            {step === 2 && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="flex justify-center mb-6 text-indigo-600">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <BluetoothSearching size={32} />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-center mb-2 text-gray-800">Proximity Verification</h2>
                    <p className="text-center text-gray-500 mb-8 max-w-sm">
                        We need to verify you are physically inside the classroom by detecting the local Bluetooth Beacon (`Classroom_101`).
                    </p>

                    {!isBluetoothSupported && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm border border-red-200">
                            Your browser does not support Bluetooth functionality. Please switch to Chrome or Edge on Windows/Android/Mac.
                        </div>
                    )}

                    <button
                        onClick={handleBluetoothScan}
                        disabled={!isBluetoothSupported}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition shadow disabled:opacity-50 mb-4 flex items-center justify-center space-x-2"
                    >
                        <Bluetooth size={20} />
                        <span>Scan for Classroom Beacon</span>
                    </button>

                    {/* Developer bypass button just in case user is testing without the real hardware */}
                    <button
                        onClick={bypassBluetoothForDev}
                        className="text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        Skip Bluetooth Verification (Dev Only)
                    </button>
                </div>
            )}

            {/* STEP 3: FACE RECOGNITION */}
            {step === 3 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Active Session</p>
                            <h3 className="text-xl font-bold text-gray-800">{classData?.subject}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Required Radius</p>
                            <span className="inline-flex items-center text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">
                                <MapPin size={16} className="mr-1" /> {classData?.radius}m
                            </span>
                        </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-inner aspect-video border border-gray-800">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                        />
                        {!modelsLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-black/50">
                                <span className="animate-pulse">Loading AI Models...</span>
                            </div>
                        )}
                        {!baseDescriptor && modelsLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 bg-black/80 p-6 text-center">
                                <ShieldAlert size={48} className="mb-4 text-red-400" />
                                <span className="text-lg font-bold">Face ID Not Found</span>
                                <span className="text-sm opacity-80 mt-2">Please go to Dashboard &gt; Setup Face ID first.</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleMark}
                        disabled={isValidating || !modelsLoaded || !baseDescriptor}
                        className="w-full flex justify-center items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow disabled:opacity-50"
                    >
                        <Camera size={20} />
                        <span>{isValidating ? 'Validating...' : 'Verify & Mark Present'}</span>
                    </button>
                </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 transform scale-110">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Success!</h2>
                    <p className="text-lg text-gray-600 mb-8">Your attendance has been marked.</p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium transition shadow-md"
                    >
                        Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
