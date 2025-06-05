import { useEffect, useRef } from 'react';

interface Node {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    const maxNodes = 15; // Increased number of nodes
    const connectionThreshold = 200; // Only connect nodes within this distance
    
    // Color variations for nodes - blue shades
    const nodeColors = [
      'rgba(0, 123, 255, 0.7)',
      'rgba(30, 144, 255, 0.6)',
      'rgba(65, 105, 225, 0.7)',
      'rgba(0, 191, 255, 0.6)',
      'rgba(32, 201, 151, 0.6)', // Adding teal accent color
    ];
    
    // Create nodes
    const createNodes = () => {
      if (!containerRef.current) return;
      
      // Clear previous nodes
      nodesRef.current.forEach(node => node.element.remove());
      nodesRef.current = [];
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      for (let i = 0; i < maxNodes; i++) {
        const node = document.createElement('div');
        
        // Random size between 4px and 10px
        const size = Math.random() * 6 + 4;
        
        // Random opacity between 0.3 and 0.9
        const opacity = Math.random() * 0.6 + 0.3;
        
        // Random color from our palette
        const color = nodeColors[Math.floor(Math.random() * nodeColors.length)];
        
        node.classList.add('node');
        // Apply pulsing animation to some nodes only
        if (Math.random() > 0.5) {
          node.classList.add('animate-pulse-slow');
        }
        
        // Set size and style
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.backgroundColor = color;
        
        // Random position within the container
        const x = Math.random() * (containerRect.width - size);
        const y = Math.random() * (containerRect.height - size);
        
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        // Slower movement for larger nodes
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
    
    // Create connections between nodes
    const createConnections = () => {
      if (!containerRef.current) return;
      
      // Clear existing connections
      const existingConnections = containerRef.current.querySelectorAll('.connection');
      existingConnections.forEach(conn => conn.remove());
      
      // Create dynamically calculated connections based on proximity
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i];
          const nodeB = nodesRef.current[j];
          
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only connect nodes that are within connectionThreshold distance
          if (distance < connectionThreshold) {
            const connection = document.createElement('div');
            connection.classList.add('connection');
            
            // Opacity based on distance (farther = more transparent)
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
    
    // Update node positions and connections
    const updateNodes = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      nodesRef.current.forEach(node => {
        // Update position based on velocity
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges with slight randomness in new velocity
        if (node.x <= 0 || node.x >= containerRect.width - node.size) {
          node.vx *= -1 * (0.9 + Math.random() * 0.2); // Add some randomness to bounce
        }
        
        if (node.y <= 0 || node.y >= containerRect.height - node.size) {
          node.vy *= -1 * (0.9 + Math.random() * 0.2);
        }
        
        // Apply new position
        node.element.style.left = `${node.x}px`;
        node.element.style.top = `${node.y}px`;
      });
      
      createConnections();
      animationRef.current = requestAnimationFrame(updateNodes);
    };
    
    // Initialize animation
    const initAnimation = () => {
      createNodes();
      animationRef.current = requestAnimationFrame(updateNodes);
    };
    
    // Start animation when component mounts
    initAnimation();
    
    // Handle window resize
    const handleResize = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Re-initialize the animation after a short delay
      setTimeout(() => {
        initAnimation();
      }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      nodesRef.current.forEach(node => node.element.remove());
      
      const existingConnections = containerRef.current?.querySelectorAll('.connection');
      existingConnections?.forEach(conn => conn.remove());
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      id="nodes-container" 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}
