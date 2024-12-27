// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

'use client'
import React, { useEffect, useRef } from "react";

const MatrixRaining = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const parentElement = canvas.parentElement;
    let width = (canvas.width = parentElement.clientWidth);
    let height = (canvas.height = parentElement.clientHeight);

    let columns = Math.floor(width / 20);

    const characters = "QUILL";
    const charArray = characters.split("");

    let drops = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    let frameRate = 20;
    let lastFrameTime = Date.now();

    const draw = () => {
      // Clear the canvas
      // ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "rgba(245, 246, 245, 0.2)";
      ctx.fillRect(0, 0, width, height);

      const colors = ["#ffc0cb"];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.font = "15px latin";

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - lastFrameTime;

      if (elapsedTime > 2500 / frameRate) {
        draw();
        lastFrameTime = currentTime;
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = parentElement.clientWidth;
      height = canvas.height = parentElement.clientHeight;
      columns = Math.floor(width / 20);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = 1;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas className="absolute top-0 left-0 w-full h-full z-[-1] pointer-events-none" ref={canvasRef}></canvas>;
};

export default MatrixRaining;
