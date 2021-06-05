import { GetStaticPaths, GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const { content } = post.data;
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const wordCount = content
    .map(item => {
      const headingWordCount = item.heading.split(' ').length;
      const bodyWordCount = item.body.reduce((accbody, currentbody) => {
        return accbody + currentbody.text.split(' ').length;
      }, 0);
      return headingWordCount + bodyWordCount;
    })
    .reduce((acc, current) => acc + current);

  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={styles.postContainer}>
      <Header />
      <img src="/Banner.svg" alt="banner" />
      <div className={styles.postContent}>
        <div className={styles.headingContainer}>
          <h1>{post.data.title}</h1>
          <p>
            <span>
              <FiCalendar className={styles.icons} />
              {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
            <span>
              <FiUser className={styles.icons} />
              {post.data.author}
            </span>
            <span>
              <FiClock className={styles.icons} />
              {readingTime} min
            </span>
          </p>
        </div>
        <div className={styles.contentContainer}>
          {post.data.content.map(contentItem => (
            <div key={Math.random()}>
              <h3>{contentItem.heading}</h3>
              {contentItem.body.map(bodyPart => (
                <p key={Math.random()}>{bodyPart.text}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
      pageSize: 2,
    }
  );

  const paths = response.results.map(post => ({
    params: { slug: String(post.uid) },
  }));
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      content: response.data.content,
      banner: response.data.banner,
      author: response.data.author,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 24 hrs
  };
};
