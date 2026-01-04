console.log('Command line args: ', process.argv);

const AUTH_API_URL = process.argv[2] || 'http://localhost:3000/graphql';

const LOGIN_MUTATION = `
mutation Login($login: LoginInput!) {
    login(input: $login) {
        id,
    }
}
`;

const JOB_API_URL = process.argv[3] || 'http://localhost:3001/graphql';

const EXECUTE_JOB_MUTATION = `
mutation ExecuteJob($executeJobInput: ExecuteJobInput!) {
    executeJob(executeJobInput: $executeJobInput) {
        name
    }
}
`;

async function login(email, password) {
  const response = await fetch(AUTH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: LOGIN_MUTATION,
      variables: { login: { email, password } },
    }),
  });

  const data = await response.json();
  const cookies = response.headers.get('set-cookie');
  return { data, cookies };
}

async function executeJob(executeJobInput, cookies) {
  const response = await fetch(JOB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies,
    },
    body: JSON.stringify({
      query: EXECUTE_JOB_MUTATION,
      variables: { executeJobInput },
    }),
  });

  const data = await response.json();
  return data;
}

(async () => {
  const { data: loginData, cookies } = await login(
    'test@gmail.com',
    'SomeTestPassword123!'
  );

  console.log(loginData);

  if (loginData?.data.login.id) {
    const n = parseInt(process.argv[4], 10) || 1000;

    console.log(`Executing Fibonacci with ${n} iterations`);

    const executeJobInput = {
      name: 'FibonacciJob',
      data: Array.from({ length: n }, () => ({
        iterations: Math.floor(Math.random() * 5000) + 1, // ran num b/w 1 and 5000
      })),
    };

    const executeData = await executeJob(executeJobInput, cookies);
    console.log(`Execute Data \n ${executeData}`);
  } else {
    console.log('error logging in');
  }
})();
