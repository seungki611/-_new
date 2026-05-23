/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Ball, CharacterType } from './types';

// Draws a beautiful sea background with a stylized pineapple house and bubbles
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bubbles: Array<{ x: number; y: number; speed: number; radius: number }>,
  jellyfish: Array<{ x: number; y: number; angle: number; speed: number; size: number }>
) {
  // 1. Tropical Undersea Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0284c7'); // sky blue
  gradient.addColorStop(0.6, '#0ea5e9'); // light aquatic blue
  gradient.addColorStop(1, '#0284c7'); // deeper sandy water blue
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Sandy Beach Floor (Bottom 40px)
  ctx.fillStyle = '#fef08a'; // beautiful yellow beach sand
  ctx.beginPath();
  ctx.moveTo(0, height - 40);
  ctx.quadraticCurveTo(width / 4, height - 50, width / 2, height - 40);
  ctx.quadraticCurveTo((3 * width) / 4, height - 30, width, height - 40);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Draw a darker sand outline/depth layer
  ctx.fillStyle = '#eab308'; // darker gold
  ctx.beginPath();
  ctx.moveTo(0, height - 15);
  ctx.quadraticCurveTo(width / 3, height - 20, width / 2, height - 15);
  ctx.quadraticCurveTo((2 * width) / 3, height - 10, width, height - 17);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // 3. Draw Background Objects: Spongy Pineapple House (Silhouette/Stylized) on the far right
  ctx.save();
  ctx.translate(width - 120, height - 180);
  // Main Pineapple body
  ctx.fillStyle = '#f97316'; // Orange pineapple
  ctx.beginPath();
  ctx.ellipse(50, 80, 45, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  // Crossed lines for pineapple texture
  ctx.strokeStyle = '#c2410c';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 6; i++) {
    // Slanted lines \
    ctx.beginPath();
    ctx.moveTo(10 + i * 15, 30);
    ctx.lineTo(-40 + i * 20, 130);
    ctx.stroke();
    // Slanted lines /
    ctx.beginPath();
    ctx.moveTo(90 - i * 15, 30);
    ctx.lineTo(140 - i * 20, 130);
    ctx.stroke();
  }

  // Pineapple Leaves
  ctx.fillStyle = '#22c55e'; // Green leaves
  ctx.beginPath();
  ctx.moveTo(50, 25);
  ctx.quadraticCurveTo(20, 0, 15, -15);
  ctx.quadraticCurveTo(40, -5, 50, 25);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(50, 25);
  ctx.quadraticCurveTo(50, -10, 50, -25);
  ctx.quadraticCurveTo(60, -5, 50, 25);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(50, 25);
  ctx.quadraticCurveTo(80, 0, 85, -15);
  ctx.quadraticCurveTo(60, -5, 50, 25);
  ctx.fill();

  // Door
  ctx.fillStyle = '#94a3b8'; // metal door
  ctx.beginPath();
  ctx.arc(50, 115, 18, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#0f172a'; // window
  ctx.beginPath();
  ctx.arc(50, 80, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();

  // 4. Draw Squidward's Easter Island Head House on the far left
  ctx.save();
  ctx.translate(60, height - 190);
  // Head block
  ctx.fillStyle = '#475569'; // grey rock
  ctx.fillRect(10, 30, 60, 110);
  // Rounded top
  ctx.beginPath();
  ctx.arc(40, 30, 30, Math.PI, 0);
  ctx.fill();
  // Big long nose
  ctx.fillStyle = '#334155';
  ctx.fillRect(33, 70, 14, 40);
  ctx.beginPath();
  ctx.arc(40, 110, 7, 0, Math.PI);
  ctx.fill();
  // Unhappy eyes (Yellow)
  ctx.fillStyle = '#fde047';
  ctx.fillRect(18, 55, 15, 12);
  ctx.fillRect(47, 55, 15, 12);
  ctx.fillStyle = '#000000';
  ctx.fillRect(23, 60, 5, 5);
  ctx.fillRect(52, 60, 5, 5);
  // Mouth
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(25, 120, 30, 8);
  ctx.restore();

  // 5. Draw Animated Jellyfish in the background
  jellyfish.forEach((jf) => {
    ctx.save();
    ctx.translate(jf.x, jf.y);
    ctx.rotate(jf.angle * 0.1);

    // Jellyfish hood (pink/purple translucent)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, jf.size, Math.PI, 0);
    ctx.fill();

    // Spots on hood
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-jf.size / 3, -jf.size / 3, jf.size / 5, 0, Math.PI * 2);
    ctx.arc(jf.size / 4, -jf.size / 2, jf.size / 6, 0, Math.PI * 2);
    ctx.fill();

    // Red tentacles waving
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 2;
    for (let t = -2; t <= 2; t++) {
      ctx.beginPath();
      ctx.moveTo((t * jf.size) / 3, 0);
      const waveX = Math.sin((Date.now() / 150) + t) * 4;
      ctx.quadraticCurveTo(
        (t * jf.size) / 3 + waveX,
        jf.size * 0.8,
        (t * jf.size) / 3 - waveX,
        jf.size * 1.5
      );
      ctx.stroke();
    }
    ctx.restore();
  });

  // 6. Draw Ambient Bubbles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  bubbles.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Highlight reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(b.x - b.radius / 3, b.y - b.radius / 3, b.radius / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  });
}

// Draws the central volleyball net and details
export function drawNet(ctx: CanvasRenderingContext2D, x: number, y: number, netHeight: number) {
  // Net pole (Bamboo textured)
  ctx.fillStyle = '#854d0e'; // dark wood
  ctx.fillRect(x - 5, y, 10, netHeight);

  // Bamboo segments stripes
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  for (let s = y + 10; s < y + netHeight; s += 22) {
    ctx.beginPath();
    ctx.moveTo(x - 5, s);
    ctx.lineTo(x + 5, s);
    ctx.stroke();
  }

  // Draw the net grid mesh (on left & right, say 15px width around pole)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  
  // Horizontal net ropes from pole
  for (let hY = y + 15; hY < y + netHeight - 10; hY += 12) {
    ctx.beginPath();
    ctx.moveTo(x - 22, hY);
    ctx.lineTo(x + 22, hY);
    ctx.stroke();
  }
  // Vertical net ropes
  for (let vX = x - 20; vX <= x + 20; vX += 10) {
    if (vX === x) continue;
    ctx.beginPath();
    ctx.moveTo(vX, y + 10);
    ctx.lineTo(vX, y + netHeight - 10);
    ctx.stroke();
  }

  // Top yellow rope/band
  ctx.fillStyle = '#eab308';
  ctx.fillRect(x - 22, y + 6, 44, 6);

  // Bottom yellow rope/band
  ctx.fillRect(x - 22, y + netHeight - 12, 44, 4);

  // Draw a cute pink jellyfish decoration sitting on top of the net pole as a roller!
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(x, y + 2, 8, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

// Draw SpongeBob procedural character
function drawSpongebob(ctx: CanvasRenderingContext2D, p: Player) {
  const { x, y, width, height, facingLeft, skillActiveTimer } = p;
  const leftX = x - width / 2;
  const topY = y - height;

  ctx.save();

  // If skill "Bubble Shield" is active, draw a giant glowing blue bubble around Spongebob
  if (skillActiveTimer > 0) {
    const bubbleGrad = ctx.createRadialGradient(x, y - height / 2, width / 2, x, y - height / 2, width);
    bubbleGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)'); // Light sky blue
    bubbleGrad.addColorStop(0.8, 'rgba(14, 165, 233, 0.4)');
    bubbleGrad.addColorStop(1, 'rgba(14, 165, 233, 0.9)');
    
    ctx.strokeStyle = 'rgba(56, 189, 248, 1)';
    ctx.lineWidth = 3;
    ctx.fillStyle = bubbleGrad;
    ctx.beginPath();
    ctx.arc(x, y - height / 2, width * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Spongebob Square Body
  ctx.fillStyle = '#fde047'; // Bright Yellow
  ctx.strokeStyle = '#ca8a04'; // dark gold outline
  ctx.lineWidth = 3;
  ctx.fillRect(leftX, topY, width, height - 15);
  ctx.strokeRect(leftX, topY, width, height - 15);

  // Cute pores/spongy circles
  ctx.fillStyle = '#ca8a04'; // Darker gold spots
  ctx.beginPath();
  ctx.arc(leftX + width * 0.2, topY + height * 0.2, 5, 0, Math.PI * 2);
  ctx.arc(leftX + width * 0.8, topY + height * 0.15, 4, 0, Math.PI * 2);
  ctx.arc(leftX + width * 0.15, topY + height * 0.6, 6, 0, Math.PI * 2);
  ctx.arc(leftX + width * 0.45, topY + height * 0.12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Face Features - Depends on direction
  const eyeOffset = facingLeft ? -6 : 6;

  // Blue Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  // Left Eye
  ctx.arc(x - 9 + eyeOffset, topY + height * 0.3, 9, 0, Math.PI * 2);
  // Right Eye
  ctx.arc(x + 9 + eyeOffset, topY + height * 0.3, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Blue Pupils
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(x - 9 + eyeOffset + (facingLeft ? -2 : 2), topY + height * 0.3, 4, 0, Math.PI * 2);
  ctx.arc(x + 9 + eyeOffset + (facingLeft ? -2 : 2), topY + height * 0.3, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x - 9 + eyeOffset + (facingLeft ? -2 : 2), topY + height * 0.3, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 9 + eyeOffset + (facingLeft ? -2 : 2), topY + height * 0.3, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Cute rosy cheeks with freckles
  ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // soft red
  ctx.beginPath();
  ctx.arc(x - 18 + eyeOffset, topY + height * 0.45, 4, 0, Math.PI * 2);
  ctx.arc(x + 18 + eyeOffset, topY + height * 0.45, 4, 0, Math.PI * 2);
  ctx.fill();

  // Big Wide Smile & Teeth
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // smile curve
  ctx.arc(x + eyeOffset, topY + height * 0.45, 12, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // White Buck Teeth (2 rectangles)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 5 + eyeOffset, topY + height * 0.45 + 11, 4, 6);
  ctx.fillRect(x + 1 + eyeOffset, topY + height * 0.45 + 11, 4, 6);
  ctx.strokeRect(x - 5 + eyeOffset, topY + height * 0.45 + 11, 4, 6);
  ctx.strokeRect(x + 1 + eyeOffset, topY + height * 0.45 + 11, 4, 6);

  // Nose (oval shape curving outwards)
  ctx.fillStyle = '#fde047';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x + eyeOffset, topY + height * 0.38, 5, 8, facingLeft ? 0.3 : -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White Shirt & Brown Shorts (Grid bottom)
  const clothesY = topY + height - 22;
  // White collar shirt
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(leftX + 2, clothesY, width - 4, 8);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(leftX + 2, clothesY, width - 4, 8);

  // Red Tie
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(x + eyeOffset / 2, clothesY + 2);
  ctx.lineTo(x - 3 + eyeOffset / 2, clothesY + 9);
  ctx.lineTo(x + eyeOffset / 2, clothesY + 12);
  ctx.lineTo(x + 3 + eyeOffset / 2, clothesY + 9);
  ctx.closePath();
  ctx.fill();

  // Brown Shorts
  ctx.fillStyle = '#78350f'; // Brown
  ctx.fillRect(leftX + 2, clothesY + 7, width - 4, 8);
  ctx.strokeRect(leftX + 2, clothesY + 7, width - 4, 8);

  // Tiny black rectangle belt segments
  ctx.fillStyle = '#000000';
  ctx.fillRect(leftX + 8, clothesY + 9, 4, 2);
  ctx.fillRect(leftX + width - 12, clothesY + 9, 4, 2);

  // Legs & Cute Shoes
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  // Left leg line
  ctx.beginPath();
  ctx.moveTo(x - 8, clothesY + 15);
  ctx.lineTo(x - 8, y);
  ctx.stroke();
  // Right leg line
  ctx.beginPath();
  ctx.moveTo(x + 8, clothesY + 15);
  ctx.lineTo(x + 8, y);
  ctx.stroke();

  // White socks (stripes on legs)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 11, y - 8, 5, 4);
  ctx.fillRect(x + 5, y - 8, 5, 4);
  // Red/Blue stripes
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x - 11, y - 8, 5, 1);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(x - 11, y - 6, 5, 1);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x + 5, y - 8, 5, 1);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(x + 5, y - 6, 5, 1);

  // Black shoes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(x - 10, y - 2, 7, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 10, y - 2, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms: if diving or jumping, arms up! Or waving!
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (p.vy !== 0) {
    // Arms up for blocking/hitting
    ctx.moveTo(leftX + 2, clothesY + 2);
    ctx.lineTo(leftX - 10, topY + 15);
    ctx.moveTo(leftX + width - 2, clothesY + 2);
    ctx.lineTo(leftX + width + 10, topY + 15);
  } else {
    // Normal arms down
    ctx.moveTo(leftX + 2, clothesY + 2);
    ctx.lineTo(leftX - 8, clothesY + 15);
    ctx.moveTo(leftX + width - 2, clothesY + 2);
    ctx.lineTo(leftX + width + 8, clothesY + 15);
  }
  ctx.stroke();

  ctx.restore();
}

// Draw Patrick Star procedural character
function drawPatrick(ctx: CanvasRenderingContext2D, p: Player) {
  const { x, y, width, height, facingLeft, skillActiveTimer } = p;
  const topY = y - height;

  ctx.save();

  // Skill Active "Star Slam" visual trail
  if (skillActiveTimer > 0) {
    // Red glowing shadow/flames under Patrick as he dives or is powered up
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - width / 1.5, y);
    ctx.bezierCurveTo(x - width, y - height / 2, x, y - height * 1.2, x, y - height);
    ctx.bezierCurveTo(x, y - height * 1.2, x + width, y - height / 2, x + width / 1.5, y);
    ctx.closePath();
    ctx.stroke();
  }

  // Draw Patrick Star conical pink body
  ctx.fillStyle = '#fda4af'; // Pink color
  ctx.strokeStyle = '#e11d48'; // deep pink borders
  ctx.lineWidth = 3;

  // Star body path
  ctx.beginPath();
  ctx.moveTo(x, topY); // Top head tip
  ctx.quadraticCurveTo(x - width * 0.5, topY + height * 0.3, x - width * 0.45, topY + height * 0.45); // Head sides/shoulders
  ctx.bezierCurveTo(x - width * 0.8, topY + height * 0.5, x - width * 0.7, topY + height * 0.7, x - width * 0.4, topY + height * 0.75); // Left arm
  ctx.bezierCurveTo(x - width * 0.5, y - 10, x - width * 0.3, y, x - width * 0.25, y); // Left leg
  ctx.lineTo(x + width * 0.25, y); // Bottom connector
  ctx.bezierCurveTo(x + width * 0.3, y, x + width * 0.5, y - 10, x + width * 0.4, topY + height * 0.75); // Right leg
  ctx.bezierCurveTo(x + width * 0.7, topY + height * 0.7, x + width * 0.8, topY + height * 0.5, x + width * 0.45, topY + height * 0.45); // Right arm
  ctx.quadraticCurveTo(x + width * 0.5, topY + height * 0.3, x, topY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw silly facial features
  const eyeOffset = facingLeft ? -4 : 4;

  // Tiny silly eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x - 5 + eyeOffset, topY + height * 0.35, 5, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 5 + eyeOffset, topY + height * 0.35, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Puppets/Black dots looking up/towards ball
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x - 5 + eyeOffset, topY + height * 0.33, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 5 + eyeOffset, topY + height * 0.33, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Angular thick eyebrows
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  // left eyebrow (angry or happy "Z" or "/" shape)
  ctx.moveTo(x - 10 + eyeOffset, topY + height * 0.27);
  ctx.lineTo(x - 2 + eyeOffset, topY + height * 0.29);
  // right eyebrow
  ctx.moveTo(x + 2 + eyeOffset, topY + height * 0.29);
  ctx.lineTo(x + 10 + eyeOffset, topY + height * 0.27);
  ctx.stroke();

  // Huge happy open mouth
  ctx.fillStyle = '#991b1b'; // dark maroon red insidemouth
  ctx.beginPath();
  ctx.arc(x + eyeOffset, topY + height * 0.48, 11, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pink tongue inside
  ctx.fillStyle = '#ff80b5';
  ctx.beginPath();
  ctx.arc(x + eyeOffset, topY + height * 0.52, 6, 0, Math.PI);
  ctx.fill();

  // Green Trunks / Shorts with Purple Flowers
  ctx.save();
  // Clip to Patrick's lower body (for simplicity we can just cover it)
  ctx.fillStyle = '#4ade80'; // Neon lime green
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.4, y - 28);
  ctx.bezierCurveTo(x - width * 0.45, y - 10, x - width * 0.3, y, x - width * 0.25, y);
  ctx.lineTo(x + width * 0.25, y);
  ctx.bezierCurveTo(x + width * 0.3, y, x + width * 0.45, y - 10, x + width * 0.4, y - 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw purple hibiscus flowers
  ctx.fillStyle = '#a855f7'; // Purple flower
  ctx.beginPath();
  ctx.arc(x - 8, y - 18, 4, 0, Math.PI * 2);
  ctx.arc(x + 10, y - 12, 3.5, 0, Math.PI * 2);
  ctx.arc(x, y - 15, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.restore();
}

// Draw Squidward procedural character
function drawSquidward(ctx: CanvasRenderingContext2D, p: Player) {
  const { x, y, width, height, facingLeft, skillActiveTimer } = p;
  const topY = y - height;

  ctx.save();

  // Skill note soundwave blast circles radiating from Squidward's clarinet
  if (skillActiveTimer > 0) {
    ctx.strokeStyle = `rgba(20, 184, 166, ${skillActiveTimer / 800})`;
    ctx.lineWidth = 2;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(x + (facingLeft ? -45 : 45), topY + height * 0.5, r * 15, -Math.PI / 3, Math.PI / 3, facingLeft);
      ctx.stroke();
    }
  }

  // Draw Squidward's thin teal body
  ctx.fillStyle = '#2dd4bf'; // Teal-400
  ctx.strokeStyle = '#0f766e'; // teal outline
  ctx.lineWidth = 3;

  // Head (oval with bulbous top)
  ctx.beginPath();
  ctx.ellipse(x, topY + 25, width * 0.45, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Unhappy eyes (Half-lidded yellow with red pupils)
  const eyeOffset = facingLeft ? -4 : 4;
  ctx.fillStyle = '#fef08a'; // yellow eyes
  ctx.beginPath();
  ctx.ellipse(x - 7 + eyeOffset, topY + 22, 6, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 7 + eyeOffset, topY + 22, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sleepy Eyelids covering half of top eyes
  ctx.fillStyle = '#2dd4bf';
  ctx.fillRect(x - 14 + eyeOffset, topY + 12, 12, 7);
  ctx.fillRect(x + eyeOffset, topY + 12, 12, 7);
  ctx.strokeStyle = '#0f766e';
  ctx.beginPath();
  ctx.moveTo(x - 14 + eyeOffset, topY + 19);
  ctx.lineTo(x - 2 + eyeOffset, topY + 19);
  ctx.moveTo(x + eyeOffset, topY + 19);
  ctx.lineTo(x + 12 + eyeOffset, topY + 19);
  ctx.stroke();

  // Red vertical pupils
  ctx.fillStyle = '#be123c'; // red pupil
  ctx.fillRect(x - 8 + eyeOffset, topY + 20, 2.5, 6);
  ctx.fillRect(x + 6 + eyeOffset, topY + 20, 2.5, 6);

  // Big drooping nose
  ctx.fillStyle = '#14b5a0'; // darker teal nose
  ctx.beginPath();
  ctx.ellipse(x + (facingLeft ? -4 : 4), topY + 38, 7, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Brown shirt (Torsos)
  ctx.fillStyle = '#b45309'; // brown
  ctx.fillRect(x - width * 0.3, topY + 48, width * 0.6, 25);
  ctx.strokeRect(x - width * 0.3, topY + 48, width * 0.6, 25);

  // Four slim tentacles (legs) dangling down
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const legsOffset = Math.sin(Date.now() / 100) * 3; // wiggle legs
  
  // Left side legs
  ctx.beginPath();
  ctx.moveTo(x - 8, topY + 70);
  ctx.quadraticCurveTo(x - 14 + legsOffset, y - 10, x - 12 - legsOffset, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 2, topY + 70);
  ctx.quadraticCurveTo(x - 6 - legsOffset, y - 8, x - 4 + legsOffset, y);
  ctx.stroke();

  // Right side legs
  ctx.beginPath();
  ctx.moveTo(x + 2, topY + 70);
  ctx.quadraticCurveTo(x + 6 + legsOffset, y - 8, x + 4 - legsOffset, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 8, topY + 70);
  ctx.quadraticCurveTo(x + 14 - legsOffset, y - 10, x + 12 + legsOffset, y);
  ctx.stroke();

  // Arms folding or waving a clarinet!
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 2.5;
  if (skillActiveTimer > 0) {
    // Hold up a black Clarinet pipe!
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + (facingLeft ? -15 : 5), topY + 46, facingLeft ? -30 : 30, 6);
    // golden end
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x + (facingLeft ? -48 : 35), topY + 44, 4, 10);
  } else {
    // boring crossed arms
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.4, topY + 54);
    ctx.lineTo(x + width * 0.4, topY + 54);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw Sandy Cheeks procedural character
function drawSandy(ctx: CanvasRenderingContext2D, p: Player) {
  const { x, y, width, height, facingLeft, skillActiveTimer } = p;
  const topY = y - height;

  ctx.save();

  // Astro suit white base
  ctx.fillStyle = '#e2e8f0'; // light white/grey
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;

  // Sandy Space Suit Body (Sphere-like chest capsule)
  ctx.beginPath();
  ctx.arc(x, y - 22, width * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White Helmet dome glass ring
  ctx.fillStyle = 'rgba(219, 234, 254, 0.2)'; // very transparent clear blue
  ctx.strokeStyle = '#0284c7'; // shiny blue outline
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, topY + 28, width * 0.44, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head of Squirrel inside helmet (Light brown)
  ctx.fillStyle = '#ea580c'; // Brown orange fur
  ctx.beginPath();
  ctx.ellipse(x, topY + 30, width * 0.32, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Round pink cheeks and light muzzle
  ctx.fillStyle = '#ffedd5'; // creamy face mask
  ctx.beginPath();
  ctx.ellipse(x, topY + 36, width * 0.25, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Small black nose
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x, topY + 32, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Squirrel buck teeth
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2.5, topY + 38, 2.5, 4);
  ctx.fillRect(x, topY + 38, 2.5, 4);
  ctx.strokeRect(x - 2.5, topY + 38, 2.5, 4);
  ctx.strokeRect(x, topY + 38, 2.5, 4);

  // Big cute eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 6, topY + 25, 5.5, 0, Math.PI * 2);
  ctx.arc(x + 6, topY + 25, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x - 6, topY + 25, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 6, topY + 25, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Squirrel Ears sticking out of head (but inside helmet)
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.ellipse(x - 10, topY + 12, 4, 8, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + 10, topY + 12, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Pink Flower on helmet glass/air lock (Trademark Sandy!)
  ctx.fillStyle = '#ec4899'; // Vibrant Pink
  ctx.beginPath();
  ctx.arc(x + 14, topY + 8, 3.5, 0, Math.PI * 2);
  ctx.arc(x + 21, topY + 10, 3.5, 0, Math.PI * 2);
  ctx.arc(x + 18, topY + 15, 3.5, 0, Math.PI * 2);
  ctx.arc(x + 12, topY + 14, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fde047'; // yellow center
  ctx.beginPath();
  ctx.arc(x + 16, topY + 12, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Karate Chop action indicator: dynamic orange slashing claws!
  if (skillActiveTimer > 0) {
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x + (facingLeft ? -25 : 25), y - 30);
    ctx.lineTo(x + (facingLeft ? -45 : 45), y - 10);
    ctx.stroke();
  }

  // Draw space suit shoes
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x - 12, y - 4, 8, 4);
  ctx.fillRect(x + 4, y - 4, 8, 4);

  ctx.restore();
}

// Dispatches the rendering to the appropriate player character
export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
  switch (p.character.type) {
    case 'SPONGEBOB':
      drawSpongebob(ctx, p);
      break;
    case 'PATRICK':
      drawPatrick(ctx, p);
      break;
    case 'SQUIDWARD':
      drawSquidward(ctx, p);
      break;
    case 'SANDY':
      drawSandy(ctx, p);
      break;
  }

  // Draw high contrast indicator above active player (1P or 2P/AI)
  ctx.save();
  ctx.fillStyle = p.id === 'P1' ? '#3b82f6' : '#ef4444'; // blue P1, red P2/AI
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - p.height - 15);
  ctx.lineTo(p.x - 6, p.y - p.height - 25);
  ctx.lineTo(p.x + 6, p.y - p.height - 25);
  ctx.closePath();
  ctx.fill();

  // Mini label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(p.id, p.x, p.y - p.height - 28);
  ctx.restore();
}

// Draws the physical volleyball with rotation, spin shadows and lines
export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  const { x, y, radius, spin } = ball;
  
  ctx.save();
  ctx.translate(x, y);
  
  // Rotate the ball rendering base based on physical spin factor!
  ctx.rotate(spin);

  // Ball Core (Spongebob Bubble Ball Theme: turquoise/white striped beach volleyball!)
  const radialGrad = ctx.createRadialGradient(-radius * 0.2, -radius * 0.2, radius * 0.1, 0, 0, radius);
  radialGrad.addColorStop(0, '#ffffff'); // bright sheen
  radialGrad.addColorStop(0.3, '#38bdf8'); // sky blue
  radialGrad.addColorStop(0.85, '#0284c7'); // beach blue
  radialGrad.addColorStop(1, '#0369a1'); // shadow
  
  ctx.fillStyle = radialGrad;
  ctx.strokeStyle = '#0c4a6e'; // dark blue border
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Draw 18-panel volleyball curved lines
  ctx.strokeStyle = '#075985';
  ctx.lineWidth = 1.3;

  // Curved segment A
  ctx.beginPath();
  ctx.arc(-radius * 0.8, 0, radius * 0.95, -Math.PI / 4, Math.PI / 4);
  ctx.stroke();

  // Curved segment B
  ctx.beginPath();
  ctx.arc(radius * 0.8, 0, radius * 0.95, 3 * Math.PI / 4, 5 * Math.PI / 4);
  ctx.stroke();

  // Cross stripes
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  ctx.lineTo(0, radius);
  ctx.stroke();

  // Shiny glossy circle overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.3, radius * 0.15, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw game particle effects like splashes, sand clouds, or spikes
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number; maxLife: number; life: number }>
) {
  ctx.save();
  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}
