/* eslint-disable @typescript-eslint/explicit-function-return-type */

import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <nav className={styles.logo}>
      <Link href="/">
        <img src="/Logo.svg" alt="logo" />
      </Link>
    </nav>
  );
}
