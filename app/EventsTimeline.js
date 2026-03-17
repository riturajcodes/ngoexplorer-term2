"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import styles from "./EventsTimeline.module.css";

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);

const OrganizerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

function formatDateGroupHeader(dateString) {
  const eventDate = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = eventDate.toDateString() === today.toDateString();
  const weekday = eventDate.toLocaleDateString('en-US', { weekday: 'long' });

  if (isToday) {
    return `Today ${weekday}`;
  }

  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  const day = eventDate.getDate();
  return `${month} ${day} ${weekday}`;
}

const EventCard = ({ event, onCardClick }) => (
  <div className={styles.eventCard} onClick={() => onCardClick(event)}>
    <div className={styles.cardContent}>
      <div className={styles.cardTime}>{event.time.split('-')[0].trim()}</div>
      <h3 className={styles.cardTitle}>{event.title}</h3>
      <div className={styles.cardMeta}>
        <span><OrganizerIcon /> By {event.organization}</span>
        <span><LocationIcon /> {event.location}</span>
      </div>
    </div>
    <div className={styles.cardImageWrapper}>
      <Image src="/eventimg.webp" alt={event.title} width={80} height={80} className={styles.cardImage} />
    </div>
  </div>
);

const EventDrawer = ({ event, isOpen, onClose, isRegistered, onRegister }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={`${styles.backdrop} ${isOpen ? styles.isOpen : ''}`} onClick={onClose} />
      <div className={`${styles.drawer} ${isOpen ? styles.isOpen : ''}`}>
        <button className={styles.closeButton} onClick={onClose}><CloseIcon /></button>
        <div className={styles.drawerContent}>
          <div className={styles.drawerImageWrapper}>
            <Image src="/eventimg.webp" alt={event.title} layout="fill" objectFit="cover" />
          </div>
          <div className={styles.drawerDetails}>
            <h2 className={styles.drawerTitle}>{event.title}</h2>
            <div className={styles.drawerMeta}>
              <span><OrganizerIcon /> {event.organization}</span>
              <span><strong>Date:</strong> {event.day}, {event.date}</span>
              <span><strong>Time:</strong> {event.time}</span>
              <span><LocationIcon /> {event.location}</span>
            </div>

            <div className={styles.registrationSection}>
              <div className={styles.approvalBadge}>Approval Required</div>
              <p>Your request will be sent to the organizer for approval.</p>
              <div className={styles.userInfo}>
                <span>Jane Doe</span>
                <span>jane.doe@example.com</span>
              </div>
              <button 
                className={`${styles.joinButton} ${isRegistered ? styles.registeredDrawerBtn : ''}`}
                onClick={() => onRegister(event.id)}
              >
                {isRegistered ? "Registered" : "Request to Join"}
              </button>
            </div>

            <div className={styles.aboutSection}>
              <h3>About Event</h3>
              <p>{event.description}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function EventsTimeline() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("upcoming");
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const saved = localStorage.getItem("registeredEvents");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse registeredEvents from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    fetch('/events.json')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
      });
  }, []);

  const handleRegister = (eventId) => {
    const updated = registeredEvents.includes(eventId)
      ? registeredEvents.filter(id => id !== eventId)
      : [...registeredEvents, eventId];
    
    setRegisteredEvents(updated);
    localStorage.setItem("registeredEvents", JSON.stringify(updated));
  };

  const processedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase());
      
      const eventDate = new Date(event.date);
      let matchesDate = true;
      if (filterType === 'upcoming') matchesDate = eventDate >= today;
      if (filterType === 'past') matchesDate = eventDate < today;

      return matchesSearch && matchesDate;
    });

    const grouped = filtered.reduce((acc, event) => {
      if (!acc[event.date]) acc[event.date] = [];
      acc[event.date].push(event);
      return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [events, searchText, filterType]);

  useEffect(() => {
  }, [searchText]);

  const handleCardClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseDrawer = () => {
    setSelectedEvent(null);
  };

  return (
    <section id="events" className={styles.timelineContainer}>
      <div className={styles.controlsHeader}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search events..."
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <button onClick={() => setFilterType('upcoming')} className={`${styles.filterBtn} ${filterType === 'upcoming' ? styles.active : ''}`}>Upcoming</button>
            <button onClick={() => setFilterType('past')} className={`${styles.filterBtn} ${filterType === 'past' ? styles.active : ''}`}>Past</button>
            <button onClick={() => setFilterType('all')} className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}>All</button>
          </div>
          <div className={styles.registeredCount}>
            Registered: <span>{registeredEvents.length}</span>
          </div>
        </div>
      </div>

      {processedEvents.length === 0 && <div className={styles.noEvents}>No events found.</div>}

      {processedEvents.map(([date, eventsOnDate]) => (
        <div key={date} className={styles.dateGroup}>
          <div className={styles.timelineMarker}>
            <div className={styles.timelineNode}></div>
            <h2 className={styles.dateHeader}>{formatDateGroupHeader(date)}</h2>
          </div>
          <div className={styles.eventsList}>
            {eventsOnDate.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onCardClick={handleCardClick} 
              />
            ))}
          </div>
        </div>
      ))}
      <EventDrawer 
        event={selectedEvent} 
        isOpen={!!selectedEvent} 
        onClose={handleCloseDrawer}
        isRegistered={selectedEvent ? registeredEvents.includes(selectedEvent.id) : false}
        onRegister={handleRegister}
      />
    </section>
  );
}