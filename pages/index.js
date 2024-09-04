import Head from 'next/head';
import TaskPriorityApp from '../components/TaskPriorityApp';

export default function Home() {
  return (
    <>
      <Head>
        <title>우선순위 정리기</title>
        <meta name="description" content="업무 우선순위를 정리하는 애플리케이션" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TaskPriorityApp />
    </>
  );
}