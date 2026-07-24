import type { VenueSet } from "../../types/universe";
import styles from "./VenueList.module.css";

interface VenueListProps {
  venues: VenueSet;
}

export function VenueList({ venues }: VenueListProps) {
  if (venues.journals.length === 0 && venues.conferences.length === 0) return null;
  return (
    <div className={styles.venueList}>
      {venues.journals.length > 0 && (
        <div>
          <h4 className={styles.heading}>Journals</h4>
          <ul>
            {venues.journals.map((journal) => (
              <li key={journal}>{journal}</li>
            ))}
          </ul>
        </div>
      )}
      {venues.conferences.length > 0 && (
        <div>
          <h4 className={styles.heading}>Conferences</h4>
          <ul>
            {venues.conferences.map((conference) => (
              <li key={conference}>{conference}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
