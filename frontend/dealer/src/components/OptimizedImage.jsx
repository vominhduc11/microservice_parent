import React, { useState, useRef, useEffect } from 'react'

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = null,
  sizes = '100vw',
  priority = false,
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const imgRef = useRef(null)
  const [isInView, setIsInView] = useState(priority)

  // Generate responsive image URLs
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return ''
    
    const widths = [320, 640, 768, 1024, 1280, 1536, 1920]
    const srcSet = widths.map(w => {
      // In production, you would use a service like Cloudinary or ImageKit
      // For now, we'll use the original image
      return `${baseSrc} ${w}w`
    }).join(', ')
    
    return srcSet
  }

  // Check WebP support
  const supportsWebP = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  // Convert image URL to WebP if supported
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return ''
    
    // In production, you would convert to WebP format
    // For now, return original src
    if (supportsWebP() && !originalSrc.includes('.webp')) {
      // Example: return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      return originalSrc
    }
    
    return originalSrc
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before image comes into view
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority])

  // Set image source when in view
  useEffect(() => {
    if (isInView && src) {
      setCurrentSrc(getOptimizedSrc(src))
    }
  }, [isInView, src])

  const handleLoad = (e) => {
    setIsLoaded(true)
    onLoad(e)
  }

  const handleError = (e) => {
    setIsError(true)
    onError(e)
  }

  // Placeholder component
  const PlaceholderComponent = () => {
    if (placeholder) {
      return placeholder
    }

    return (
      <div 
        className={`bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-slate-400 text-2xl">📷</div>
      </div>
    )
  }

  // Error component
  const ErrorComponent = () => (
    <div 
      className={`bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center text-slate-400">
        <div className="text-2xl mb-2">🖼️</div>
        <div className="text-sm">Không thể tải ảnh</div>
      </div>
    </div>
  )

  return (
    <div ref={imgRef} className="relative">
      {/* Show placeholder while loading or not in view */}
      {(!isInView || !isLoaded) && !isError && <PlaceholderComponent />}
      
      {/* Show error state */}
      {isError && <ErrorComponent />}
      
      {/* Main image */}
      {isInView && currentSrc && (
        <picture>
          {/* WebP source for modern browsers */}
          {supportsWebP() && (
            <source
              srcSet={generateSrcSet(currentSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp'))}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback image */}
          <img
            src={currentSrc}
            srcSet={generateSrcSet(currentSrc)}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      )}
    </div>
  )
}

// Higher-order component for image optimization
export const withImageOptimization = () => {
  return React.forwardRef((props, ref) => {
    const optimizedProps = {
      ...props,
      // Add default optimization props
      loading: props.loading || 'lazy',
      decoding: props.decoding || 'async',
    }

    return <WrappedComponent ref={ref} {...optimizedProps} />
  })
}

// Hook for preloading images
export const useImagePreloader = (imageSources = []) => {
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [failedImages, setFailedImages] = useState(new Set())

  useEffect(() => {
    const preloadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]))
          resolve(src)
        }
        img.onerror = () => {
          setFailedImages(prev => new Set([...prev, src]))
          reject(src)
        }
        img.src = src
      })
    }

    const preloadAll = async () => {
      const promises = imageSources.map(src => 
        preloadImage(src).catch(() => null) // Don't fail the whole batch
      )
      
      await Promise.allSettled(promises)
    }

    if (imageSources.length > 0) {
      preloadAll()
    }
  }, [imageSources])

  return {
    loadedImages,
    failedImages,
    isLoaded: (src) => loadedImages.has(src),
    isFailed: (src) => failedImages.has(src),
    progress: imageSources.length > 0 ? loadedImages.size / imageSources.length : 0
  }
}

// Progressive image loading component
export const ProgressiveImage = ({ 
  lowQualitySrc, 
  highQualitySrc, 
  alt, 
  className = '',
  ...props 
}) => {
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setIsHighQualityLoaded(true)
    img.src = highQualitySrc
  }, [highQualitySrc])

  return (
    <div className="relative">
      {/* Low quality placeholder */}
      <img
        src={lowQualitySrc}
        alt={alt}
        className={`${className} ${isHighQualityLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500 filter blur-sm`}
        {...props}
      />
      
      {/* High quality image */}
      {isHighQualityLoaded && (
        <img
          src={highQualitySrc}
          alt={alt}
          className={`${className} absolute inset-0 opacity-100 transition-opacity duration-500`}
          {...props}
        />
      )}
    </div>
  )
}

export default OptimizedImage
