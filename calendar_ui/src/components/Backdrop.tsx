"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface BackdropProps {
  onClick?: () => void;
  zIndex?: number;
  blurAmount?: string;
  opacity?: number;
}

const Backdrop = ({
  onClick,
  zIndex = 9999,
  blurAmount = "4px",
}: BackdropProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = backdropRef.current;
    if (node) {
      document.body.appendChild(node);
      return () => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      };
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-${zIndex}`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`absolute h-screen w-screen bg-black/30 bg-opacity-50 backdrop-blur-[${blurAmount}]`}
        onClick={onClick}
      />
    </div>
  );
};

export default Backdrop;
