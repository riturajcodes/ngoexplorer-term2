"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./hero.module.css";
import EventsTimeline from "./EventsTimeline";

export default function Home() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
      setTime(`${timeString} GMT+5:30`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      <div className={styles.hero}>
        <div className={styles.backgroundWrapper}>
          <Image
            src="/blr-desktop.avif"
            alt="Vidhana Soudha, Bengaluru"
            fill
            priority
            className={styles.backgroundImage}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span className={styles.subtitle}>What&apos;s Happening in</span>
          <h1 className={styles.heading}>NGO events in Bengaluru</h1>
          <div className={styles.timestamp}>{time}</div>
          <p className={styles.description}>
            Discover NGO events in Bengaluru. The
            community in this vibrant city comes together for a brighter, more
            meaningful future.
          </p>
          <Link href="#events" className={styles.cta}>
            Show Events
          </Link>
        </div>
      </div>
      <EventsTimeline />
    </main>
  );
}
