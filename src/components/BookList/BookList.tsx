import type { Book } from "../../types/universe";
import styles from "./BookList.module.css";

interface BookListProps {
  books: Book[];
}

export function BookList({ books }: BookListProps) {
  if (books.length === 0) return null;
  return (
    <ul className={styles.bookList}>
      {books.map((book) => (
        <li key={book.title} className={styles.book}>
          <p className={styles.title}>{book.title}</p>
          <p className={styles.meta}>
            {book.authors.join(", ")}
            {book.level && <span className={styles.level}> · {book.level}</span>}
          </p>
          {book.coverage_note && <p className={styles.note}>{book.coverage_note}</p>}
        </li>
      ))}
    </ul>
  );
}
