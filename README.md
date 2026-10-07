# Jobify - Full-Stack MERN Job Tracking Application

Jobify is a production-ready, full-stack MERN application designed to help job seekers log, track, manage, and analyze job applications through an intuitive, responsive dashboard.

---

## Tech Stack & Architecture

### Backend
- **Node.js & Express.js** (ES Modules) - REST API server with structured routing and controllers.
- **MongoDB & Mongoose** - Document database with schema modeling, validation, and aggregation pipelines.
- **JWT Authentication** - Stateless token-based authentication stored in secure `httpOnly` cookies.
- **Password Security** - Salted password hashing via `bcryptjs`.
- **Request Validation** - Declarative request and param validation using `express-validator`.
- **File Uploads & Cloud Storage** - Multipart form handling via `multer` and cloud asset hosting via `cloudinary`.
- **Centralized Error Handling** - Async error trapping via `express-async-errors` and typed custom error classes.

### Frontend
- **React 19 & Vite** - Fast Single-Page Application (SPA) with modern bundling.
- **React Router v7** - Data-driven routing using `createBrowserRouter`, route `loader`s, and `action`s.
- **Styled-Components** - Scoped component styling and dynamic CSS variable theming.
- **Data Visualization** - Monthly application trends and status breakdowns using `recharts`.
- **UI Notifications** - Toast alerts with `react-toastify`.
- **Theme Persistence** - Instant Dark Mode / Light Mode toggle persisted in `localStorage`.

---

## Directory & File Overview

```
jobify/
├── server.js                      # Express app entry, middleware stack, DB connection
├── populate.js                    # Mock data seeding script for development
├── package.json                   # Backend dependencies & concurrently dev scripts
├── controllers/
│   ├── authController.js          # Register, login (JWT cookie), logout
│   ├── jobController.js           # CRUD operations, query filters, stats aggregation
│   └── userController.js          # Current user, app stats, profile update + Cloudinary upload
├── models/
│   ├── JobModel.js                # Job schema (position, company, status, type, location, createdBy)
│   └── UserModel.js               # User schema (name, email, password hash, role, avatar)
├── routes/
│   ├── authRouter.js              # /api/v1/auth (register, login, logout)
│   ├── jobRouter.js               # /api/v1/jobs (CRUD + stats)
│   └── userRouter.js              # /api/v1/users (current-user, update-user, admin stats)
├── middleware/
│   ├── authMiddleware.js          # authenticateUser, authorizePermissions, checkForTestUser
│   ├── validationMiddleware.js    # express-validator rules for jobs, users, params
│   ├── errorHandlerMiddleware.js  # Global error catch-all handler
│   └── multerMiddleware.js        # Disk storage configuration for avatar image uploads
├── errors/
│   └── customErrors.js            # NotFoundError, BadRequestError, UnauthenticatedError, UnauthorizedError
├── utils/
│   ├── constants.js               # JOB_STATUS, JOB_TYPE, JOB_SORT_BY enums
│   ├── passwordUtils.js           # hashPassword, comparePassword via bcryptjs
│   ├── tokenUtils.js              # createJWT, verifyJWT
│   └── mockData.json              # Sample jobs data for testing and populating DB
├── public/                        # Built frontend bundle served directly by Express in production
└── client/                        # React Frontend
    ├── vite.config.js             # Vite configuration with API proxy (/api -> localhost:5100)
    └── src/
        ├── App.jsx                # Router configuration with loaders, actions, and routes
        ├── main.jsx               # React DOM root entry point
        ├── index.css              # Global tokens, color scales, utility classes, dark theme
        ├── pages/
        │   ├── HomeLayout.jsx     # Root layout wrapper
        │   ├── Landing.jsx        # Public hero landing page
        │   ├── Register.jsx       # User registration with action
        │   ├── Login.jsx          # Login form + 1-click Demo User button
        │   ├── DashboardLayout.jsx# Protected shell (sidebar, navbar, user context, logout)
        │   ├── AddJob.jsx         # Create job form
        │   ├── AllJobs.jsx        # Search filter container + paginated job listings
        │   ├── EditJob.jsx        # Edit existing job
        │   ├── DeleteJob.jsx      # Job deletion action
        │   ├── Stats.jsx          # Default stats cards + monthly applications charts
        │   ├── Profile.jsx        # User profile editor with avatar upload
        │   ├── Admin.jsx          # Admin-only platform metrics
        │   └── Error.jsx          # Custom 404 / 500 error boundary
        ├── components/
        │   ├── Navbar.jsx         # Header bar with sidebar toggle, theme toggle, logout menu
        │   ├── BigSidebar.jsx     # Desktop sidebar navigation
        │   ├── SmallSidebar.jsx   # Mobile flyout sidebar
        │   ├── NavLinks.jsx       # Navigation links (filtered dynamically by user role)
        │   ├── SearchContainer.jsx# Debounced search & filter form
        │   ├── JobContainer.jsx   # Job cards grid with empty state
        │   ├── Job.jsx            # Individual job card
        │   ├── JobInfo.jsx        # Metadata tags (icon + text)
        │   ├── PageBtnContainer.jsx# Complex pagination with next/prev and ellipsis
        │   ├── StatsContainer.jsx # Metric cards (Pending, Interview, Declined)
        │   ├── StatItem.jsx       # Individual metric card component
        │   ├── ChartsContainer.jsx# Toggleable BarChart / AreaChart view
        │   ├── BarChart.jsx       # Recharts Bar Chart component
        │   ├── AreaChart.jsx      # Recharts Area Chart component
        │   ├── FormRow.jsx        # Reusable controlled text input with label
        │   ├── FormRowSelect.jsx  # Reusable select dropdown with options list
        │   ├── SubmitBtn.jsx      # Animated submit button with pending state
        │   ├── ThemeToggle.jsx    # Dark/light mode switcher
        │   └── LogoutContainer.jsx# User badge dropdown with logout trigger
        └── utils/
            ├── customFetch.js     # Axios instance configured with baseURL: '/api/v1'
            └── links.jsx          # Sidebar navigation routes and icons
```

---

## Core Features & Implementation Details

### 1. Authentication & Role-Based Access Control
- **Cookie-Based JWT**: When logging in, the server generates a signed JSON Web Token and sets an `httpOnly` cookie with a 24-hour expiration. This mitigates XSS token theft compared to storing tokens in `localStorage`.
- **First-User Admin Promotion**: The registration controller dynamically counts documents in MongoDB; the very first user registered is automatically assigned `role: "admin"`, while all subsequent accounts default to `role: "user"`.
- **Role Authorization**: Protected routes like `/api/v1/users/admin/app-stats` use the `authorizePermissions("admin")` middleware to block unauthorized access with a `403 Forbidden` error.
- **Admin Dashboard**: Admin users see an exclusive "Admin" link in their sidebar with live application metrics (Total Users and Total Jobs count).

### 2. Demo User System (Read-Only "Explore The App")
- A dedicated button on the login screen lets visitors log in with pre-configured demo credentials (`test@test.com`).
- The `checkForTestUser` middleware intercepts mutating requests (`POST`, `PATCH`, `DELETE`) made by the demo user ID and throws a descriptive `400 Bad Request` ("Demo user Read only!!!"), keeping the shared demo account protected from vandalism.

### 3. Job Management (CRUD)
- **Create**: Add jobs specifying position, company, status (`pending`, `interview`, `declined`), job type (`full-time`, `part-time`, `internship`), and location.
- **Read**: Fetch user-specific jobs with full search, filter, and pagination support.
- **Update**: Edit existing job details with pre-populated fields using React Router `loader` data.
- **Delete**: Instant deletion action with automatic redirect and toast alert.
- **User Scoping**: Every job document stores a `createdBy` ObjectId reference. Queries strictly match `createdBy: req.user.userId` so users can only ever access their own data.

### 4. Advanced Search, Filtering & Pagination
- **Text Search**: Real-time regex search across both `position` and `company` fields (`$or` query).
- **Status & Type Filtering**: Filter jobs by exact `jobStatus` and `jobType` directly from the backend query.
- **Sorting**: Flexible sorting by `newest` (`-createdAt`), `oldest` (`createdAt`), `a-z` (`position`), and `z-a` (`-position`).
- **Server-Side Pagination**: Queries utilize `.skip((page - 1) * limit).limit(10)`. The frontend `PageBtnContainer` features intelligent pagination buttons that dynamically render page numbers with ellipsis (`...`) for scalable page navigation.

### 5. Application Statistics & Aggregation Pipeline
- **Status Counts**: Uses MongoDB `Job.aggregate()` to group and count jobs matching the user's ID by status (`$match` -> `$group`), normalized into `defaultStats` (`pending`, `interview`, `declined`).
- **Monthly Application Trends**: Groups applications by year and month, sorts descending, limits to the latest 6 months, formats the dates using `dayjs` (e.g., `"Sep 26"`), and passes the data to frontend charts.
- **Interactive Charts**: The `ChartsContainer` component allows users to switch between Recharts `BarChart` and `AreaChart` visualizations.

### 6. User Profile & Cloudinary Avatar Uploads
- Users can update their profile information (name, last name, email, location).
- Profile avatars are handled via `multer` (storing uploads temporarily on disk) and uploaded to **Cloudinary** using its Node SDK.
- The user document stores `avatar` (secure URL) and `avatarPublicId`. When a user uploads a new avatar, the previous image is automatically deleted from Cloudinary (`cloudinary.v2.uploader.destroy`) to avoid storage leaks.

### 7. Global Theming & Responsive Design
- Fully responsive interface featuring collapsible sidebar navigation for desktops and flyout drawer navigation for mobile screens.
- Dark theme toggle switches CSS variables globally (`document.body.classList.toggle("dark-theme")`) and synchronizes state with `localStorage`.

### 8. Production Server Build
- The client app is compiled via Vite into static assets.
- `server.js` serves the compiled bundle using `express.static(path.resolve(__dirname, "./public"))`.
- A fallback catch-all route (`app.get("*", ...)`) serves `index.html` to support HTML5 client-side routing.

---

## API Endpoints Reference

| Method | Endpoint | Middleware / Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | `validateRegisterInput` | Register a new user |
| `POST` | `/api/v1/auth/login` | `validateLoginInput` | Authenticate user & set JWT cookie |
| `GET` | `/api/v1/auth/logout` | Public | Invalidate & clear JWT cookie |
| `GET` | `/api/v1/users/current-user` | `authenticateUser` | Fetch currently authenticated user |
| `PATCH` | `/api/v1/users/update-user` | `authenticateUser`, `checkForTestUser`, `multer`, `validateUpdateUserInput` | Update user profile & avatar |
| `GET` | `/api/v1/users/admin/app-stats` | `authenticateUser`, `authorizePermissions("admin")` | System metrics (Admin only) |
| `GET` | `/api/v1/jobs` | `authenticateUser` | Get jobs (search, filter, sort, paginate) |
| `POST` | `/api/v1/jobs` | `authenticateUser`, `checkForTestUser`, `validateJobInput` | Create a new job |
| `GET` | `/api/v1/jobs/stats` | `authenticateUser` | Fetch job status counts & monthly trend |
| `GET` | `/api/v1/jobs/:id` | `authenticateUser`, `validateIdParam` | Fetch a single job by ID |
| `PATCH` | `/api/v1/jobs/:id` | `authenticateUser`, `checkForTestUser`, `validateJobInput`, `validateIdParam` | Update job details |
| `DELETE` | `/api/v1/jobs/:id` | `authenticateUser`, `checkForTestUser`, `validateIdParam` | Delete job by ID |

---

## Local Development & Setup

### Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
PORT=5100
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

### Running the Application

1. **Install Dependencies**:
   ```sh
   npm run setup-project
   ```
2. **Run in Development Mode (Concurrently)**:
   ```sh
   npm run dev
   ```
   Starts the backend server on port `5100` and the Vite client dev server on port `5173` with live reload.
3. **Build Client & Run Production Server**:
   ```sh
   cd client && npm run build
   cp -r dist/* ../public/
   npm run server
   ```

---

## Course Notes & Upcoming Steps (Deployment & Advanced Topics)

#### Deploy On Render

[Render](https://render.com/)

- sign up of for account
- create git repository

#### Build Front-End on Render

- add script
- change path

package.json

```js
 "scripts": {
    "setup-production-app": "npm i && cd client && npm i && npm run build",
  },
```

server.js

```js
app.use(express.static(path.resolve(__dirname, './client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'));
});
```

#### Test Locally

- remove client/dist and client/node_modules
- remove node_modules and package-lock.json (optional)
- run "npm run setup-production-app", followed by "node server"

#### Test in Production

- change build command on render

```sh
npm run setup-production-app
```

- push up to github

#### Upload Image As Buffer

- remove public folder

```sh
npm i datauri@4.1.0
```

middleware/multerMiddleware.js

```js
import multer from 'multer';
import DataParser from 'datauri/parser.js';
import path from 'path';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const parser = new DataParser();

export const formatImage = (file) => {
  const fileExtension = path.extname(file.originalname).toString();
  return parser.format(fileExtension, file.buffer).content;
};

export default upload;
```

controller/userController.js

```js
import { formatImage } from '../middleware/multerMiddleware.js';

export const updateUser = async (req, res) => {
  const newUser = { ...req.body };
  delete newUser.password;
  if (req.file) {
    const file = formatImage(req.file);
    const response = await cloudinary.v2.uploader.upload(file);
    newUser.avatar = response.secure_url;
    newUser.avatarPublicId = response.public_id;
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.userId, newUser);

  if (req.file && updatedUser.avatarPublicId) {
    await cloudinary.v2.uploader.destroy(updatedUser.avatarPublicId);
  }
  res.status(StatusCodes.OK).json({ msg: 'update user' });
};
```

#### Setup Global Loading

- create loading component (import/export)
- check for loading in DashboardLayout page

components/Loading.jsx

```js
const Loading = () => {
  return <div className='loading'></div>;
};

export default Loading;
```

DashboardLayout.jsx

```js
import { useNavigation } from 'react-router-dom';
import { Loading } from '../components';

const DashboardLayout = ({ isDarkThemeEnabled }) => {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';

  return (
    <Wrapper>
      ...
      <div className='dashboard-page'>
        {isPageLoading ? <Loading /> : <Outlet context={{ user }} />}
      </div>
      ...
    </Wrapper>
  );
};
```

#### React Query

React Query is a powerful library that simplifies data fetching, caching, and synchronization in React applications. It provides a declarative and intuitive way to manage remote data by abstracting away the complex logic of fetching and caching data from APIs. React Query offers features like automatic background data refetching, optimistic updates, pagination support, and more, making it easier to build performant and responsive applications that rely on fetching and manipulating data.

[React Query Docs](https://tanstack.com/query/v4/docs/react/overview)

- in the client

```sh
npm i @tanstack/react-query@4.29.5 @tanstack/react-query-devtools@4.29.6
```

App.jsx

```js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```

#### Page Error Element

- create components/ErrorElement

```js
import { useRouteError } from 'react-router-dom';

const Error = () => {
  const error = useRouteError();
  console.log(error);
  return <h4>There was an error...</h4>;
};
export default ErrorElement;
```

Stats.jsx

```js
export const loader = async () => {
  const response = await customFetch.get('/jobs/stats');
  return response.data;
};
```

App.jsx

```js
{
  path: 'stats',
  element: <Stats />,
  loader: statsLoader,
  errorElement: <h4>There was an error...</h4>
},
```

```js
{
  path: 'stats',
  element: <Stats />,
  loader: statsLoader,
  errorElement: <ErrorElement />,
},
```

#### First Query

- navigate to stats

Stats.jsx

```js
import { ChartsContainer, StatsContainer } from '../components';
import customFetch from '../utils/customFetch';
import { useLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export const loader = async () => {
  return null;
};

const Stats = () => {
  const response = useQuery({
    queryKey: ['stats'],
    queryFn: () => customFetch.get('/jobs/stats'),
  });
  console.log(response);
  if (response.isLoading) {
    return <h1>Loading...</h1>;
  }
  return <h1>react query</h1>;
  return (
    <>
      <StatsContainer defaultStats={defaultStats} />
      {monthlyApplications?.length > 1 && (
        <ChartsContainer data={monthlyApplications} />
      )}
    </>
  );
};
export default Stats;
```

```js
const data = useQuery({
  queryKey: ['stats'],
  queryFn: () => customFetch.get('/jobs/stats'),
});
```

const data = useQuery({ ... });: This line declares a constant variable named data and assigns it the result of the useQuery hook. The useQuery hook is provided by React Query and is used to perform data fetching.

queryKey: ['stats'],: The queryKey property is an array that serves as a unique identifier for the query. In this case, the query key is set to ['stats'], indicating that this query is fetching statistics related to jobs.

queryFn: () => customFetch.get('/jobs/stats'),: The queryFn property specifies the function that will be executed when the query is triggered. In this case, it uses an arrow function that calls customFetch.get('/jobs/stats'). The customFetch object is likely a custom wrapper around the fetch function or an external HTTP client library, used to make the actual API request to retrieve job statistics.In React Query, the queryFn property expects a function that returns a promise. The promise should resolve with the data you want to fetch and store in the query cache.

customFetch.get('/jobs/stats'): This line is making an HTTP GET request to the /jobs/stats endpoint, which is the API route that provides the job statistics data.

#### Get Stats with React Query

```js
const statsQuery = {
  queryKey: ['stats'],
  queryFn: async () => {
    const response = await customFetch.get('/jobs/stats');
    return response.data;
  },
};

export const loader = async () => {
  return null;
};

const Stats = () => {
  const { isLoading, isError, data } = useQuery(statsQuery);

  if (isLoading) return <h4>Loading...</h4>;
  if (isError) return <h4>Error...</h4>;
  // after loading/error or ?.
  const { defaultStats, monthlyApplications } = data;

  return (
    <>
      <StatsContainer defaultStats={defaultStats} />
      {monthlyApplications?.length > 1 && (
        <ChartsContainer data={monthlyApplications} />
      )}
    </>
  );
};
export default Stats;
```

#### React Query in Stats Loader

App.jsx

```js
{
  path: 'stats',
  element: <Stats />,
  loader: statsLoader(queryClient),
  errorElement: <ErrorElement />,
},
```

Stats.jsx

```js
import { ChartsContainer, StatsContainer } from '../components';
import customFetch from '../utils/customFetch';
import { useQuery } from '@tanstack/react-query';

const statsQuery = {
  queryKey: ['stats'],
  queryFn: async () => {
    const response = await customFetch.get('/jobs/statss');
    return response.data;
  },
};

export const loader = (queryClient) => async () => {
  const data = await queryClient.ensureQueryData(statsQuery);
  return data;
};

const Stats = () => {
  const { data } = useQuery(statsQuery);
  const { defaultStats, monthlyApplications } = data;

  return (
    <>
      <StatsContainer defaultStats={defaultStats} />
      {monthlyApplications?.length > 1 && (
        <ChartsContainer data={monthlyApplications} />
      )}
    </>
  );
};
export default Stats;
```

#### React Query for Current User

DashboardLayout.jsx

```js
const userQuery = {
  queryKey: ['user'],
  queryFn: async () => {
    const { data } = await customFetch('/users/current-user');
    return data;
  },
};

export const loader = (queryClient) => async () => {
  try {
    return await queryClient.ensureQueryData(userQuery);
  } catch (error) {
    return redirect('/');
  }
};

const Dashboard = ({ prefersDarkMode, queryClient }) => {
  const { user } = useQuery(userQuery)?.data;
};
```

#### Invalidate Queries

Login.jsx

```js
export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    try {
      await axios.post('/api/v1/auth/login', data);
      queryClient.invalidateQueries();
      toast.success('Login successful');
      return redirect('/dashboard');
    } catch (error) {
      toast.error(error.response.data.msg);
      return error;
    }
  };
```

DashboardLayout.jsx

```js
const logoutUser = async () => {
  navigate('/');
  await customFetch.get('/auth/logout');
  queryClient.invalidateQueries();
  toast.success('Logging out...');
};
```

Profile.jsx

```js
export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('avatar');
    if (file && file.size > 500000) {
      toast.error('Image size too large');
      return null;
    }
    try {
      await customFetch.patch('/users/update-user', formData);
      queryClient.invalidateQueries(['user']);
      toast.success('Profile updated successfully');
      return redirect('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return null;
    }
  };
```

#### All Jobs Query

AllJobs.jsx

```js
import { toast } from 'react-toastify';
import { JobsContainer, SearchContainer } from '../components';
import customFetch from '../utils/customFetch';
import { useLoaderData } from 'react-router-dom';
import { useContext, createContext } from 'react';
import { useQuery } from '@tanstack/react-query';
const AllJobsContext = createContext();

const allJobsQuery = (params) => {
  const { search, jobStatus, jobType, sort, page } = params;
  return {
    queryKey: [
      'jobs',
      search ?? '',
      jobStatus ?? 'all',
      jobType ?? 'all',
      sort ?? 'newest',
      page ?? 1,
    ],
    queryFn: async () => {
      const { data } = await customFetch.get('/jobs', {
        params,
      });
      return data;
    },
  };
};

export const loader =
  (queryClient) =>
  async ({ request }) => {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ]);

    await queryClient.ensureQueryData(allJobsQuery(params));
    return { searchValues: { ...params } };
  };

const AllJobs = () => {
  const { searchValues } = useLoaderData();
  const { data } = useQuery(allJobsQuery(searchValues));
  return (
    <AllJobsContext.Provider value={{ data, searchValues }}>
      <SearchContainer />
      <JobsContainer />
    </AllJobsContext.Provider>
  );
};
export default AllJobs;

export const useAllJobsContext = () => useContext(AllJobsContext);
```

#### Invalidate Jobs

AddJob.jsx

```js
export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    try {
      await customFetch.post('/jobs', data);
      queryClient.invalidateQueries(['jobs']);
      toast.success('Job added successfully ');
      return redirect('all-jobs');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };
```

EditJob.jsx

```js
export const action =
  (queryClient) =>
  async ({ request, params }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    try {
      await customFetch.patch(`/jobs/${params.id}`, data);
      queryClient.invalidateQueries(['jobs']);
      toast.success('Job edited successfully');
      return redirect('/dashboard/all-jobs');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };
```

DeleteJob.jsx

```js
export const action =
  (queryClient) =>
  async ({ params }) => {
    try {
      await customFetch.delete(`/jobs/${params.id}`);
      queryClient.invalidateQueries(['jobs']);
      toast.success('Job deleted successfully');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
    return redirect('/dashboard/all-jobs');
  };
```

#### Edit Job Loader

```js
import { FormRow, FormRowSelect, SubmitBtn } from '../components';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { useLoaderData, useParams } from 'react-router-dom';
import { JOB_STATUS, JOB_TYPE } from '../../../utils/constants';
import { Form, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
import { useQuery } from '@tanstack/react-query';

const singleJobQuery = (id) => {
  return {
    queryKey: ['job', id],
    queryFn: async () => {
      const { data } = await customFetch.get(`/jobs/${id}`);
      return data;
    },
  };
};

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      await queryClient.ensureQueryData(singleJobQuery(params.id));
      return params.id;
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return redirect('/dashboard/all-jobs');
    }
  };

export const action =
  (queryClient) =>
  async ({ request, params }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    try {
      await customFetch.patch(`/jobs/${params.id}`, data);
      queryClient.invalidateQueries(['jobs']);

      toast.success('Job edited successfully');
      return redirect('/dashboard/all-jobs');
    } catch (error) {
      toast.error(error?.response?.data?.msg);
      return error;
    }
  };

const EditJob = () => {
  const id = useLoaderData();

  const {
    data: { job },
  } = useQuery(singleJobQuery(id));

  return (
    <Wrapper>
      <Form method='post' className='form'>
        <h4 className='form-title'>edit job</h4>
        <div className='form-center'>
          <FormRow type='text' name='position' defaultValue={job.position} />
          <FormRow type='text' name='company' defaultValue={job.company} />
          <FormRow
            type='text'
            name='jobLocation'
            labelText='job location'
            defaultValue={job.jobLocation}
          />
          <FormRowSelect
            name='jobStatus'
            labelText='job status'
            defaultValue={job.jobStatus}
            list={Object.values(JOB_STATUS)}
          />
          <FormRowSelect
            name='jobType'
            labelText='job type'
            defaultValue={job.jobType}
            list={Object.values(JOB_TYPE)}
          />
          <SubmitBtn formBtn />
        </div>
      </Form>
    </Wrapper>
  );
};
export default EditJob;
```

#### Axios Interceptors

DashboardLayout.jsx

```js
const DashboardContext = createContext();

const DashboardLayout = ({ isDarkThemeEnabled }) => {
  const [isAuthError, setIsAuthError] = useState(false);

  const logoutUser = async () => {
    await customFetch.get('/auth/logout');
    toast.success('Logging out...');
    navigate('/');
  };

  customFetch.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error?.response?.status === 401) {
        setIsAuthError(true);
      }
      return Promise.reject(error);
    }
  );
  useEffect(() => {
    if (!isAuthError) return;
    logoutUser();
  }, [isAuthError]);
  return (
    ...
  )
};

```

#### Security

```sh
npm install helmet express-mongo-sanitize express-rate-limit

```

Package: helmet
Description: helmet is a security package for Express.js applications that helps protect them by setting various HTTP headers to enhance security, prevent common web vulnerabilities, and improve overall application security posture.
Need: The package is needed to safeguard web applications from potential security threats, such as cross-site scripting (XSS) attacks, clickjacking, and other security exploits.

Package: express-mongo-sanitize
Description: express-mongo-sanitize is a middleware for Express.js that sanitizes user-supplied data coming from request parameters, body, and query strings to prevent potential NoSQL injection attacks on MongoDB databases.
Need: The package addresses the need to protect MongoDB databases from malicious attempts to manipulate data and helps ensure the integrity of data storage and retrieval.

Package: express-rate-limit
Description: express-rate-limit is an Express.js middleware that helps control and limit the rate of incoming requests from a specific IP address or a set of IP addresses to protect the server from abuse, brute-force attacks, and potential denial-of-service (DoS) attacks.
Need: This package is necessary to manage and regulate the number of requests made to the server within a given time frame, preventing excessive usage and improving the overall stability and performance of the application.

server.js

```js
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

app.use(helmet());
app.use(mongoSanitize());
```

routes/authRouter.js

```js
import rateLimiter from 'express-rate-limit';

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { msg: 'IP rate limit exceeded, retry in 15 minutes.' },
});
router.post('/register', apiLimiter, validateRegisterInput, register);
router.post('/login', apiLimiter, validateLoginInput, login);
```
