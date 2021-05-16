/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
  last_publication_date: string | null;
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;
  const [nextPage, setNextPage] = useState(next_page);
  const [nextPagePosts, setNextPagePosts] = useState<Post[]>([]);

  const fetchNextPagePosts = async () => {
    const response = await fetch(nextPage, {
      method: 'GET',
    }).then(res => res.json());

    setNextPagePosts([...nextPagePosts, ...response.results]);
    setNextPage(response.next_page);
  };

  return (
    <main className={styles.container}>
      <Header />
      <div className={styles.postContainer}>
        {results.map(post => (
          <div key={post.uid} className={styles.posts}>
            <Link href={`/post/${post.uid}`}>
              <h1>{post.data.title}</h1>
            </Link>
            <p>{post.data.subtitle}</p>
            <span>
              <FiCalendar className={styles.icons} />{' '}
              {post.last_publication_date}
            </span>
            <span>
              <FiUser className={styles.icons} /> {post.data.author}
            </span>
          </div>
        ))}
        {nextPagePosts.length > 0 &&
          nextPagePosts.map(newPost => (
            <div key={newPost.uid} className={styles.posts}>
              <Link href={`/post/${newPost.uid}`}>
                <h1>{newPost.data.title}</h1>
              </Link>
              <p>{newPost.data.subtitle}</p>
              <span>
                <FiCalendar className={styles.icons} />{' '}
                {format(
                  parseISO(newPost.last_publication_date),
                  'dd MMM yyyy',
                  {
                    locale: ptBR,
                  }
                )}
              </span>
              <span>
                <FiUser className={styles.icons} /> {newPost.data.author}
              </span>
            </div>
          ))}
      </div>
      {nextPage !== null && (
        <button type="button" onClick={fetchNextPagePosts}>
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      last_publication_date: format(
        parseISO(post.last_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const { next_page } = postsResponse;

  const postsPagination = {
    next_page,
    results,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60, // 60 minutes
  };
};
