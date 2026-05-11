const apiLandingPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExistingSky | Backend API</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #030712;
            --card-bg: rgba(255, 255, 255, 0.03);
            --card-border: rgba(255, 255, 255, 0.08);
            --primary: #38bdf8;
            --primary-glow: rgba(56, 189, 248, 0.3);
            --secondary: #818cf8;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --success: #10b981;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            line-height: 1.5;
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(129, 140, 248, 0.05) 0%, transparent 50%);
            min-height: 100vh;
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 4rem 2rem;
            position: relative;
            z-index: 1;
        }

        /* Abstract shapes */
        .blob {
            position: fixed;
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            filter: blur(150px);
            opacity: 0.1;
            z-index: 0;
            border-radius: 50%;
            pointer-events: none;
        }
        .blob-1 { top: -10%; left: -10%; }
        .blob-2 { bottom: -10%; right: -10%; }

        header {
            margin-bottom: 4rem;
            text-align: center;
        }

        .logo-container {
            display: inline-flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 100px;
            color: var(--success);
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.025em;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background-color: var(--success);
            border-radius: 50%;
            box-shadow: 0 0 12px var(--success);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }

        h1 {
            font-size: 3.5rem;
            font-weight: 800;
            letter-spacing: -0.04em;
            margin-bottom: 1rem;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p.subtitle {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 4rem;
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            padding: 2rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(12px);
        }

        .card:hover {
            border-color: rgba(56, 189, 248, 0.4);
            transform: translateY(-5px);
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
        }

        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(to right, var(--primary), var(--secondary));
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .card:hover::before {
            opacity: 1;
        }

        .endpoint-path {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            color: var(--primary);
            background: rgba(56, 189, 248, 0.1);
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 1rem;
        }

        .card h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--text-main);
        }

        .card p {
            font-size: 0.95rem;
            color: var(--text-muted);
        }

        .footer {
            margin-top: 6rem;
            text-align: center;
            border-top: 1px solid var(--card-border);
            padding-top: 3rem;
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        .code-block {
            background: #000;
            padding: 1.5rem;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            margin-top: 2rem;
            border: 1px solid var(--card-border);
            text-align: left;
            position: relative;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            overflow-x: auto;
        }

        .code-block span.key { color: #f472b6; }
        .code-block span.string { color: #34d399; }
        .code-block span.number { color: #fbbf24; }

        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .container { padding: 2rem 1.5rem; }
        }
    </style>
</head>
<body>
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="container">
        <header>
            <div class="logo-container">
                <div class="status-badge">
                    <div class="status-dot"></div>
                    System Operational
                </div>
            </div>
            <h1>ExistingSky API</h1>
            <p class="subtitle">A high-performance backend infrastructure powering the next generation of sports betting experiences.</p>
            
            <div class="code-block">
                <div>{</div>
                <div style="padding-left: 20px;"><span class="key">"message"</span>: <span class="string">"ExistingSky Backend API"</span>,</div>
                <div style="padding-left: 20px;"><span class="key">"version"</span>: <span class="string">"v1.0"</span>,</div>
                <div style="padding-left: 20px;"><span class="key">"status"</span>: <span class="string">"healthy"</span></div>
                <div>}</div>
            </div>
        </header>

        <div class="grid">
            <div class="card">
                <div class="endpoint-path">/api/v1/auth</div>
                <h3>Authentication</h3>
                <p>Secure JWT-based authentication system with multi-role support and rate limiting.</p>
            </div>
            <div class="card">
                <div class="endpoint-path">/api/v1/banking</div>
                <h3>Banking & Payments</h3>
                <p>Real-time transaction processing, wallet management, and payment gateway integrations.</p>
            </div>
            <div class="card">
                <div class="endpoint-path">/api/v1/bets</div>
                <h3>Betting Engine</h3>
                <p>High-concurrency betting logic, odds calculation, and automated settlement systems.</p>
            </div>
            <div class="card">
                <div class="endpoint-path">/api/v1/matches</div>
                <h3>Match Management</h3>
                <p>Live data feeds, event scheduling, and real-time score updates for global matches.</p>
            </div>
            <div class="card">
                <div class="endpoint-path">/api/v1/users</div>
                <h3>User Profiles</h3>
                <p>Comprehensive user management, KYC verification, and activity tracking.</p>
            </div>
            <div class="card">
                <div class="endpoint-path">/api/v1/reports</div>
                <h3>Analytics & Reports</h3>
                <p>Deep insights into performance metrics, financial reports, and user behavior.</p>
            </div>
        </div>

        <footer class="footer">
            <p>&copy; 2026 ExistingSky Infrastructure. All rights reserved.</p>
            <p style="margin-top: 0.5rem; opacity: 0.5;">Environment: Production | Region: Global</p>
        </footer>
    </div>
</body>
</html>
\`;

module.exports = { apiLandingPage };
