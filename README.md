# Diagnostics

Web front-end made in [**Angular**](https://angular.dev/) for [Hosokava's](https://github.com/Hosokava/) [Diagnostyka-App](https://github.com/Hosokava/Diagnostyka-App)

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.11.

## Installation

### Docker (Recommended for all platforms)
Docker ensures the app runs exactly the same on Windows and Linux without worrying about local Node.js versions.

1. **Prerequisites:**
   * **Windows**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [Git](https://git-scm.com/), then run Docker Desktop
   * **Linux**: Install `docker` + `docker-compose` on your system and make sure it's running.
3. **Terminal setup:**
   ```bash
   git clone https://github.com/RC-GitHub/Diagnostics.git
   cd Diagnostics

   # IMPORTANT: Complete the "Environment Configuration" section below first!
   
   docker compose up
   ```

---

### Manual Setup - Windows
1. **Prerequisites:** Install [Node.js](https://nodejs.org/) (LTS), [Git](https://git-scm.com/), and [PostgreSQL](https://www.postgresql.org/download/windows/).
2. **Database Setup:**
   Open **pgAdmin** (installed with PostgreSQL) and run:
   ```sql
   CREATE DATABASE diagnostics;
   CREATE USER myuser WITH PASSWORD 'mypassword';
   GRANT ALL PRIVILEGES ON DATABASE diagnostics TO myuser;
   ```
   You will use these credentials (`DB_USER`, `DB_PASSWORD`) in the `.env` file during the Environment Configuration step below.
3. **Install API:** Install Diagnostyka-App API from [the official repository](https://github.com/Hosokava/Diagnostyka-App) by following the instructions in its [FRONTEND_HANDOFF.md](https://github.com/Hosokava/Diagnostyka-App/blob/main/FRONTEND_HANDOFF.md).
4. **Clone Front-end:**
   ```powershell
   git clone 'https://github.com/RC-GitHub/Diagnostics.git'
   cd Diagnostics
   cd diagnostics
   npm install
   ```

### Manual Setup - Linux
1. **Install API:** Install Diagnostyka-App API from [the official repository](https://github.com/Hosokava/Diagnostyka-App) by following the instructions in its [FRONTEND_HANDOFF.md](https://github.com/Hosokava/Diagnostyka-App/blob/main/FRONTEND_HANDOFF.md).
2. **Install Node.js, PostgreSQL & Dependencies:**
   * **Arch-based:** `sudo pacman -S nodejs npm postgresql`
   * **Debian-based:** `sudo apt update && sudo apt install nodejs npm build-essential postgresql postgresql-contrib`
3. **Database Setup:**
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE diagnostics;"
   sudo -u postgres psql -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE diagnostics TO myuser;"
   ```
   You will use these credentials (`DB_USER`, `DB_PASSWORD`) in the `.env` file during the Environment Configuration step below.
4. **Clone Front-end:**
   ```bash
   git clone https://github.com/RC-GitHub/Diagnostics.git
   cd Diagnostics
   cd diagnostics
   npm install
   ```

## Environment Configuration
The application relies on a `.env` file. **This step must be completed before running the app or Docker.**

1. **Create the file:**
   ```bash
   cd ../ # Make sure you're in the 'Diagnostics' directory
   
   # Linux/macOS/Git Bash
   cp .env.example .env
   
   # Windows (PowerShell)
   copy .env.example .env
   ```
2. **Edit your variables:**
   Open `.env` and configure:
   * **DB_...:** Credentials for your [PostgreSQL](https://www.postgresql.org/) database.
   * **JWT_SECRET:** A long, random string.
   * **AES_KEY:** 64 character random hex string.
   * **SMTP_...:** Credentials for your email sending account.

> [!IMPORTANT]
> Never commit your `.env` file to GitHub. It is already included in the `.gitignore` to protect your secrets.

---

## Running & Testing

### Using Docker
* **Start Server:** `docker compose up`
* **View Logs:** `docker compose logs -f`

### Using Manual Setup

1. Run PostgreSQL database with correct credentials.
2. Head to `Diagnostyka-App` folder and run the API with `go run server.go`.
3. Head back to `Diagnostics` folder, then `diagnostics` subfolder.

#### Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

#### Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

#### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

#### Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

#### Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

#### Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
