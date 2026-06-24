import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface NetworkNode {
  element: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export default function NetworkAnimation() {
  const shouldReduceMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<NetworkNode[]>([]);
  const animationRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotionRef = useRef(shouldReduceMotion);

  useEffect(() => {
    shouldReduceMotionRef.current = shouldReduceMotion;

    if (shouldReduceMotion && resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = null;
    }
  }, [shouldReduceMotion]);
  
  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const maxNodes = 15;
    const connectionThreshold = 200;
    
    const nodeColors = [
      'rgba(0, 123, 255, 0.7)',
      'rgba(30, 144, 255, 0.6)',
      'rgba(65, 105, 225, 0.7)',
      'rgba(0, 191, 255, 0.6)',
      'rgba(32, 201, 151, 0.6)',
    ];
    
    const createNodes = () => {
      if (!containerRef.current) return;
      
      nodesRef.current.forEach(node => node.element.remove());
      nodesRef.current = [];
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      for (let i = 0; i < maxNodes; i++) {
        const node = document.createElement('div');
        
        const size = Math.random() * 6 + 4;
        
        const opacity = Math.random() * 0.6 + 0.3;
        
        const color = nodeColors[Math.floor(Math.random() * nodeColors.length)];
        
        node.classList.add('node');
        if (Math.random() > 0.5) {
          node.classList.add('animate-pulse-slow');
        }
        
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.backgroundColor = color;
        
        const x = Math.random() * (containerRect.width - size);
        const y = Math.random() * (containerRect.height - size);
        
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        const speedFactor = (10 - size/2) / 10;
        
        nodesRef.current.push({
          element: node,
          x,
          y,
          vx: (Math.random() * 0.4 - 0.2) * speedFactor,
          vy: (Math.random() * 0.4 - 0.2) * speedFactor,
          size,
          opacity,
          color
        });
        
        containerRef.current.appendChild(node);
      }
    };
    
    const createConnections = () => {
      if (!containerRef.current) return;
      
      const existingConnections = containerRef.current.querySelectorAll('.connection');
      existingConnections.forEach(conn => conn.remove());
      
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i];
          const nodeB = nodesRef.current[j];
          
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionThreshold) {
            const connection = document.createElement('div');
            connection.classList.add('connection');
            
            const opacity = 0.5 * (1 - distance / connectionThreshold);
            connection.style.backgroundColor = `rgba(0, 123, 255, ${opacity})`;
            
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            connection.style.width = `${distance}px`;
            connection.style.left = `${nodeA.x + nodeA.size/2}px`;
            connection.style.top = `${nodeA.y + nodeA.size/2}px`;
            connection.style.transform = `rotate(${angle}deg)`;
            
            containerRef.current.appendChild(connection);
          }
        }
      }
    };
    
    const updateNodes = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      nodesRef.current.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x <= 0 || node.x >= containerRect.width - node.size) {
          node.vx *= -1 * (0.9 + Math.random() * 0.2);
        }
        
        if (node.y <= 0 || node.y >= containerRect.height - node.size) {
          node.vy *= -1 * (0.9 + Math.random() * 0.2);
        }
        
        node.element.style.left = `${node.x}px`;
        node.element.style.top = `${node.y}px`;
      });
      
      createConnections();
      animationRef.current = requestAnimationFrame(updateNodes);
    };
    
    const initAnimation = () => {
      createNodes();
      animationRef.current = requestAnimationFrame(updateNodes);
    };
    
    initAnimation();
    
    const handleResize = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        resizeTimeoutRef.current = null;
        if (shouldReduceMotionRef.current) {
          return;
        }

        initAnimation();
      }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    const container = containerRef.current;
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
      
      nodesRef.current.forEach(node => node.element.remove());
      
      const existingConnections = container?.querySelectorAll('.connection');
      existingConnections?.forEach(conn => conn.remove());
    };
  }, [shouldReduceMotion]);
  
  return (
    <div 
      ref={containerRef} 
      id="nodes-container" 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}
