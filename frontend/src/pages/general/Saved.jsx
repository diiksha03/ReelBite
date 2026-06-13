import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import axios from 'axios'
import ReelFeed from '../../components/ReelFeed'

const Saved = () => {
    const [ videos, setVideos ] = useState([])
    const [ loading, setLoading ] = useState(true)

    const getVideoUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return `http://localhost:3000/${cleanUrl}`;
    };

    useEffect(() => {
        axios.get("http://localhost:3000/api/food/saved-list", { withCredentials: true })
            .then(response => {
                console.log("=== SAVED DATA FETCHED ===", response.data);

                if (response.data && response.data.savedFoods) {
                    const savedFoods = response.data.savedFoods.map((food) => {
                        const mainUrl = getVideoUrl(food.videoUrl || food.video || food.url);
                        return {
                            ...food,
                            _id: food._id,
                            id: food._id,
                            name: food.name || "Delicious Food",
                            video: mainUrl, 
                            videoUrl: mainUrl,
                            url: mainUrl,
                            src: mainUrl,
                            description: food.description || "",
                            likeCount: food.likeCount || 0,
                            savesCount: food.savesCount || 0,
                            commentsCount: food.commentsCount || 0,
                            isLikedByMe: food.isLikedByMe ?? false, 
                            isSavedByMe: food.isSavedByMe ?? true 
                        };
                    });
                    
                    setVideos(savedFoods);
                }
            })
            .catch(err => {
                console.error("Error fetching saved videos:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleLikeToggle = async (item) => {
        const targetState = !item.isLikedByMe;

     
        setVideos((prevVideos) => {
            return prevVideos.map((v) => {
                if (v._id === item._id) {
                    const currentCount = v.likeCount || 0;
                    return {
                        ...v,
                        isLikedByMe: targetState,
                        likeCount: targetState ? currentCount + 1 : Math.max(0, currentCount - 1)
                    };
                }
                return v;
            });
        });

        try {
            const res = await axios.post("http://localhost:3000/api/food/like", { foodId: item._id }, { withCredentials: true });
            
            if (res.data && res.data.likeCount !== undefined) {
               
                setVideos((prevVideos) =>
                    prevVideos.map((v) =>
                        v._id === item._id
                            ? { ...v, likeCount: res.data.likeCount, isLikedByMe: !!res.data.isLikedByMe }
                            : v
                    )
                );
            }
        } catch (err) {
            console.error("Error toggling like inside saved view:", err);
           
            setVideos((prevVideos) =>
                prevVideos.map((v) =>
                    v._id === item._id
                        ? {
                              ...v,
                              isLikedByMe: !targetState,
                              likeCount: !targetState ? (v.likeCount + 1) : Math.max(0, v.likeCount - 1),
                          }
                        : v
                )
            );
        }
    };

    const removeSaved = async (item) => {
        setVideos((prev) => prev.filter((v) => v._id !== item._id));

        try {
            await axios.post("http://localhost:3000/api/food/save-toggle", { foodId: item._id }, { withCredentials: true });
        } catch (err) {
            console.error("Error removing saved video:", err);
        }
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '45vh', fontSize: '18px' }}>Loading Saved Collection... 📂</div>;
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#000' }}>
            {videos.length === 0 ? (
                <div style={{ color: 'white', textAlign: 'center', paddingTop: '45vh', fontSize: '18px' }}>
                    No saved videos found. 🍿
                </div>
            ) : (
                <ReelFeed
                    items={videos}
                    videos={videos} 
                    onLike={handleLikeToggle} 
                    onSave={removeSaved}
                    emptyMessage="No saved videos yet."
                />
            )}
        </div>
    );
};

export default Saved;