import React, { useEffect, useState, useRef } from 'react';
import axiosActual from 'axios'; 
import '../styles/home-feed.css'; 
import { toast } from 'react-hot-toast';

const HomeFeed = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const fetchFoods = async () => {
        try {
            const response = await axiosActual.get("http://localhost:3000/api/food", {
                withCredentials: true
            });
            
            let foodItems = [];
            if (response.data && Array.isArray(response.data.foodItems)) {
                foodItems = response.data.foodItems;
            } else if (Array.isArray(response.data)) {
                foodItems = response.data;
            }

            setFoods(foodItems.filter(Boolean));
        } catch (error) {
            console.error("Error fetching feed:", error);
            toast.error("Failed to load food feed.");
            setFoods([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, []);

    return (
        <div style={{ width: '100%', height: '100vh', backgroundColor: '#000', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}>
            {loading ? (
                <div className="feed-loading">Loading Delicious Feed... 🍔</div>
            ) : (!foods || foods.length === 0) ? (
                <div className="feed-empty">No food videos uploaded yet! 🍿</div>
            ) : (
                <div className="reels-container">
                    {foods.map((food) => (
                        food && food._id ? <ReelCard key={food._id} food={food} /> : null
                    ))}
                </div>
            )}
        </div>
    );
};

const ReelCard = ({ food }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);


    const [isLiked, setIsLiked] = useState(!!food.isLikedByMe); 
    const [isSaved, setIsSaved] = useState(!!food.isSavedByMe);
    
   
    const [likesCount, setLikesCount] = useState(food.likeCount || 0);
    const [savesCount, setSavesCount] = useState(food.savesCount || 0);

    
    useEffect(() => {
        setIsLiked(!!food.isLikedByMe);
        setIsSaved(!!food.isSavedByMe);
        setLikesCount(food.likeCount || 0);
        setSavesCount(food.savesCount || 0);
    }, [food]);

    const getVideoUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return `http://localhost:3000/${cleanUrl}`;
    };

    const handleVideoClick = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(err => console.log(err));
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleLikeClick = async (e) => {
        e.stopPropagation(); 
        const targetState = !isLiked;
        
      
        setIsLiked(targetState);
        setLikesCount(prev => targetState ? prev + 1 : Math.max(0, prev - 1));

        try {
            const res = await axiosActual.post("http://localhost:3000/api/food/like", { foodId: food._id }, { withCredentials: true });
            if (res.data && res.data.likeCount !== undefined) {
                setLikesCount(res.data.likeCount);
                setIsLiked(!!res.data.isLikedByMe);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Please login to like videos! ❤️");
            }
            
            setIsLiked(!targetState);
            setLikesCount(prev => !targetState ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    const handleSaveClick = async (e) => {
        e.stopPropagation();
        const targetState = !isSaved;
        
        setIsSaved(targetState);
        setSavesCount(prev => targetState ? prev + 1 : Math.max(0, prev - 1));

        try {
            const res = await axiosActual.post("http://localhost:3000/api/food/save-toggle", { foodId: food._id }, { withCredentials: true });
            if (res.data && res.data.savesCount !== undefined) {
                setSavesCount(res.data.savesCount);
                setIsSaved(!!res.data.isSavedByMe);
                if (res.data.isSavedByMe) {
                    toast.success("Saved to your collection! 📂");
                }
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Please login to save videos! 📂");
            }
            setIsSaved(!targetState);
            setSavesCount(prev => !targetState ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    return (
        <div className="reel-card">
            <video ref={videoRef} className="reel-video" src={getVideoUrl(food.video || food.videoUrl)} loop playsInline autoPlay muted onClick={handleVideoClick} preload="metadata" />

            {!isPlaying && (
                <div className="pause-overlay" onClick={handleVideoClick}>
                    <svg className="pause-icon" viewBox="0 0 24 24" fill="currentColor" width="50" height="50"><path d="M8 5v14l11-7z"/></svg>
                </div>
            )}

            <div className="reel-actions" style={{ position: 'absolute', right: '12px', bottom: '110px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 12 }}>
                {/* Like Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                    <button onClick={handleLikeClick} style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', color: isLiked ? '#ff4757' : '#fff', cursor: 'pointer' }}>
                        <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                    <span style={{ fontSize: '12px', marginTop: '4px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontWeight: '500' }}>{likesCount}</span>
                </div>

                {/* Bookmark Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                    <button onClick={handleSaveClick} style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', color: isSaved ? '#ffa500' : '#fff', cursor: 'pointer' }}>
                        <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" width="22" height="22"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </button>
                    <span style={{ fontSize: '12px', marginTop: '4px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontWeight: '500' }}>{savesCount}</span>
                </div>

                {/* Comment Info */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                    <button style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', color: '#fff' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    </button>
                    <span style={{ fontSize: '12px', marginTop: '4px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontWeight: '500' }}>{food.commentsCount ?? (Array.isArray(food.comments) ? food.comments.length : 0)}</span>
                </div>
            </div>

            <div className="reel-details">
                <h2 className="food-reel-title">{food.name}</h2>
                <p className="food-reel-description">{food.description}</p>
            </div>
        </div>
    );
};

export default HomeFeed;