import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import '../../styles/create-food.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; 

const CreateFood = () => {
    const [ name, setName ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ videoFile, setVideoFile ] = useState(null);
    const [ videoURL, setVideoURL ] = useState('');
    const [ fileError, setFileError ] = useState('');
    const [ isUploading, setIsUploading ] = useState(false);
    const [ isSuccess, setIsSuccess ] = useState(false); 
    const [ uploadProgress, setUploadProgress ] = useState(0);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!videoFile) {
            setVideoURL('');
            return;
        }
        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);
        return () => URL.revokeObjectURL(url);
    }, [ videoFile ]);

    const onFileChange = (e) => {
        const file = e.target.files && e.target.files[ 0 ];
        if (!file) { setVideoFile(null); setFileError(''); return; }
        if (!file.type.startsWith('video/')) { setFileError('Please select a valid video file.'); return; }
        
        if (file.size > 20 * 1024 * 1024) { 
            setFileError('File too large! Maximum allowed size is 20MB for optimization.');
            setVideoFile(null);
            return;
        }

        setFileError('');
        setVideoFile(file);
        setIsSuccess(false); 
        setUploadProgress(0); 
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files?.[ 0 ];
        if (!file) { return; }
        if (!file.type.startsWith('video/')) { setFileError('Please drop a valid video file.'); return; }
        
    
        if (file.size > 20 * 1024 * 1024) { 
            setFileError('File too large! Maximum allowed size is 20MB for optimization.');
            setVideoFile(null);
            return;
        }

        setFileError('');
        setVideoFile(file);
        setIsSuccess(false); 
        setUploadProgress(0); 
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const openFileDialog = () => fileInputRef.current?.click();

    const onSubmit = (e) => {
        e.preventDefault();
        setIsUploading(true);
        setIsSuccess(false); 
        setUploadProgress(0); 

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append("mama", videoFile);

        const token = localStorage.getItem("token");

        axios.post("http://localhost:3000/api/food", formData, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
            timeout: 90000,
            
            
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted); 
                }
            }
        })
        .then((response) => {
            setIsUploading(false);
            setIsSuccess(true); 
            console.log("Upload Success:", response.data);
            
            toast.success("Food item created successfully!");
            
            setTimeout(() => {
                navigate("/");
            }, 1500);
        })
        .catch((error) => {
            setIsUploading(false);
            setIsSuccess(false);
            setUploadProgress(0); 
            console.error("Detailed Upload Error:", error);
            
            if (error.code === 'ECONNABORTED') {
                toast.error("Upload Timeout: Server took too long to respond.");
            } else if (error.response) {
                toast.error(error.response.data.message || "Failed to create food item.");
            } else {
                toast.error("Network Error: Unable to connect to backend server.");
            }
        });
    };

    const isDisabled = useMemo(() => !name.trim() || !videoFile || isUploading, [ name, videoFile, isUploading ]);

    return (
        <div className="create-food-page">
            <div className="create-food-card">
                <header className="create-food-header">
                    <h1 className="create-food-title">Create Food</h1>
                    <p className="create-food-subtitle">Upload a short video, give it a name, and add a description.</p>
                </header>

                <form className="create-food-form" onSubmit={onSubmit}>
                    <div className="field-group">
                        <label htmlFor="foodVideo">Food Video</label>
                        <input
                            id="foodVideo"
                            ref={fileInputRef}
                            className="file-input-hidden"
                            type="file"
                            accept="video/*"
                            onChange={onFileChange}
                        />

                        <div
                            className="file-dropzone"
                            role="button"
                            tabIndex={0}
                            onClick={openFileDialog}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFileDialog(); } }}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        >
                            <div className="file-dropzone-inner">
                                <svg className="file-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M12 4V20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div className="file-dropzone-text">
                                    <strong>Tap to upload</strong> or drag and drop
                                </div>
                                <div className="file-hint">MP4, WebM, MOV • Up to 20MB</div>
                            </div>
                        </div>

                        {fileError && <p className="error-text" role="alert" style={{ color: '#ff4d4d', marginTop: '8px', fontSize: '14px' }}>{fileError}</p>}

                        {videoFile && (
                            <div className="file-chip" aria-live="polite">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M9 12.75v-1.5c0-.62.67-1 1.2-.68l4.24 2.45c.53.3.53 1.05 0 1.35L10.2 16.82c-.53.31-1.2-.06-1.2-.68v-1.5" />
                                </svg>
                                <span className="file-chip-name">{videoFile.name}</span>
                                <span className="file-chip-size">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</span>
                                <div className="file-chip-actions">
                                    <button type="button" className="btn-ghost" disabled={isUploading} onClick={openFileDialog}>Change</button>
                                    <button type="button" className="btn-ghost danger" disabled={isUploading} onClick={() => { setVideoFile(null); setFileError(''); setIsSuccess(false); setUploadProgress(0); }}>Remove</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {videoURL && (
                        <div className="video-preview">
                            <video className="video-preview-el" src={videoURL} controls playsInline preload="metadata" />
                        </div>
                    )}

                    <div className="field-group">
                        <label htmlFor="foodName">Name</label>
                        <input
                            id="foodName"
                            type="text"
                            placeholder="e.g., Spicy Paneer Wrap"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setIsSuccess(false); }}
                            required
                            disabled={isUploading}
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="foodDesc">Description</label>
                        <textarea
                            id="foodDesc"
                            rows={4}
                            placeholder="Write a short description: ingredients, taste, spice level, etc."
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); setIsSuccess(false); }}
                            disabled={isUploading}
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            className="btn-primary" 
                            type="submit" 
                            disabled={isDisabled}
                            style={{
                                backgroundColor: isSuccess ? '#28a745' : '',
                                borderColor: isSuccess ? '#28a745' : '',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            
                            {isUploading ? `Uploading... ${uploadProgress}%` : isSuccess ? "Uploaded! ✓" : "Save Food"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFood;