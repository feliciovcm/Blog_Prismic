import { GetStaticPaths, GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import commonStyles from '../../styles/common.module.scss';
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Post({ post }: PostProps) {
  return (
    <div className={styles.postContainer}>
      <Header />
      <img src="/Banner.svg" alt="banner" />
      <div className={styles.postContent}>
        <div className={styles.headingContainer}>
          <h1>{post.data.title}</h1>
          <p>
            <span>{post.first_publication_date}</span>
            <span>{post.data.author}</span>
            <span>4 min</span>
          </p>
        </div>
        <div className={styles.contentContainer}>
          {post.data.content.map(content => (
            <>
              <h3>{content.heading}</h3>
              {content.body.map(bodyPart => (
                <p>{bodyPart.text}</p>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const paths = [];
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    slug,
    first_publication_date: format(
      parseISO(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
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
