import React, { useEffect, useState } from 'react'
import axios from 'axios';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'

const Home = () => {
    const [ videos, setVideos ] = useState([])

    useEffect(() => {
        axios.get("http://localhost:3000/api/food", { withCredentials: true })
            .then(response => {
                console.log(response.data);
                setVideos(response.data.foodItems)
            })
            .catch(() => {  })
    }, [])

    async function likeVideo(item) {
        const response = await axios.post("http://localhost:3000/api/food/like", { foodId: item._id }, { withCredentials: true })

        
        const currentLikes = item.likeCount || 0;

      
        if (response.data.message === "Food liked successfully") {
            console.log("Video liked successfully");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: currentLikes + 1 } : v))
        } else if (response.data.message === "Food unliked successfully") {
            console.log("Video unliked successfully");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: Math.max(0, currentLikes - 1) } : v))
        }
    }

    async function saveVideo(item) {
        const response = await axios.post("http://localhost:3000/api/food/save", { foodId: item._id }, { withCredentials: true })
        
       
        const currentSaves = item.savesCount || 0;

       
        if (response.data.message === "Food saved successfully") {
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: currentSaves + 1 } : v))
        } else if (response.data.message === "Food unsaved successfully") {
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: Math.max(0, currentSaves - 1) } : v))
        }
    }

    return (
        <ReelFeed
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            emptyMessage="No videos available."
        />
    )
}

export default Home