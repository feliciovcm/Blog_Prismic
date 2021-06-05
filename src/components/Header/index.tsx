import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <nav className={styles.logo}>
      <Link href="/" passHref>
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </nav>
  );
}
