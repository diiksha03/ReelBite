import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => { /* ignore autoplay errors */ })
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items])

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return }
    videoRefs.current.set(id, el)
  }

  const formatCount = (value) => {
    return isNaN(value) || value === undefined || value === null ? 0 : value;
  }

  return (
    <div style={{ 
        width: '100%', height: '100vh', backgroundColor: '#000', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none'
    }}>
      <div className="reels-feed" role="list">
        {items.length === 0 && (
          <div style={{ color: 'white', textAlign: 'center', padding: '100px 20px', height: '100vh', backgroundColor: '#121212', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <p>{emptyMessage}</p>
          </div>
        )}

        {items.map((item) => {
          const getVideoUrl = (url) => {
              if (!url) return '';
              if (url.startsWith('http://') || url.startsWith('https://')) return url;
              const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
              return `http://localhost:3000/${cleanUrl}`;
          };

          // Direct dynamic pointer variables reading straight from Saved page array state
          const activeLike = !!item.isLikedByMe;
          const activeSave = !!item.isSavedByMe;

          return (
            <section 
              key={item._id} 
              role="listitem" 
              style={{ width: '100%', height: '100vh', position: 'relative', background: '#000', cursor: 'pointer', scrollSnapAlign: 'start' }}
            >
              <video
                ref={setVideoRef(item._id)}
                src={getVideoUrl(item.video || item.videoUrl)}
                muted playsInline loop preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <div className="reel-overlay">
                
                {/* RIGHT FLOATING ACTION BUTTONS */}
                <div style={{ position: 'absolute', right: '15px', bottom: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 12 }}>
                  
                  {/* Like Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                    <button
                      onClick={onLike ? (e) => { e.stopPropagation(); onLike(item); } : undefined}
                      style={{ 
                        background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', 
                        color: activeLike ? '#ff4757' : '#fff', cursor: 'pointer' 
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill={activeLike ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" width="22" height="22">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                    <span style={{ fontSize: '11px', marginTop: '4px', textShadow: '1px 1px 2px #000', fontWeight: '500' }}>
                      {formatCount(item.likeCount ?? item.likesCount ?? item.likes)}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                    <button
                      onClick={onSave ? (e) => { e.stopPropagation(); onSave(item); } : undefined}
                      style={{ 
                        background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', 
                        color: activeSave ? '#ffa500' : '#fff', cursor: 'pointer' 
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill={activeSave ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" width="22" height="22">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                    <span style={{ fontSize: '11px', marginTop: '4px', textShadow: '1px 1px 2px #000', fontWeight: '500' }}>
                      {formatCount(item.savesCount ?? item.bookmarks ?? item.saves)}
                    </span>
                  </div>

                  {/* Comment Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', cursor: 'pointer' }}>
                    <button style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', color: '#fff' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    </button>
                    <span style={{ fontSize: '11px', marginTop: '4px', textShadow: '1px 1px 2px #000', fontWeight: '500' }}>
                      {formatCount(item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0))}
                    </span>
                  </div>
                </div>

                {/* LEFT BOTTOM TEXT LAYOUT */}
                <div style={{ position: 'absolute', bottom: '100px', left: '15px', color: '#fff', zIndex: 10, pointerEvents: 'none', paddingRight: '80px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 6px 0', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    {item.name || "Spicy Tuna Roll"} 
                  </h2> 
                  <p style={{ fontSize: '13px', margin: '0', opacity: 0.9, textShadow: '1px 1px 3px rgba(0,0,0,0.8)', lineHeight: '1.4' }}>
                    {item.description}
                  </p>
                  {item.foodPartner && (
                    <Link to={"/food-partner/" + item.foodPartner} style={{ pointerEvents: 'auto', display: 'inline-block', background: '#ff4757', color: 'white', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', marginTop: '8px', textDecoration: 'none', fontWeight: '600' }}>
                      Visit store
                    </Link>
                  )}
                </div>

              </div>
            </section>
          );
        })}
      </div>
    </div>
  )
}

export default ReelFeed;