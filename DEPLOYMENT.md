# Simple AWS Deployment Guide for Beginners

This guide will help you deploy SkyGuard-Scheduler to AWS step-by-step, without Docker.

## 📋 What You'll Need

- AWS Account (free tier works)
- OpenWeatherMap API Key (free tier available)
- OpenAI API Key
- Basic command line knowledge

## 🏗️ Architecture Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   CloudFront    │──────│   S3 Bucket     │      │   EC2 Server   │
│   (Frontend)    │      │   (Static Files)│      │   (Backend API)│
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                          │
                                                          ▼
                                                  ┌─────────────────┐
                                                  │   RDS Database  │
                                                  │   (PostgreSQL)  │
                                                  └─────────────────┘
```

---

## Step 1: Set Up Database (RDS PostgreSQL)

### 1.1 Create RDS Database

1. Go to **AWS Console** → Search for **"RDS"** → Click **"Create database"**

2. Choose these settings:
   - **Database creation method**: Standard create
   - **Engine type**: PostgreSQL
   - **Version**: PostgreSQL 15 (or latest)
   - **Template**: Free tier (or Production if you need more)
   - **DB instance identifier**: `skyguard-db`
   - **Master username**: `flight_user`
   - **Master password**: Create a strong password (save it!)
   - **DB instance class**: `db.t3.micro` (free tier eligible)
   - **Storage**: 20 GB
   - **VPC**: Default VPC
   - **Public access**: **Yes** (so EC2 can connect)
   - **Database name**: `flight_schedule_db`

3. Click **"Create database"**
4. Wait 5-10 minutes for it to be ready

### 1.2 Get Database Connection Info

1. Go to **RDS** → **Databases** → Click on `skyguard-db`
2. Copy the **Endpoint** (looks like: `skyguard-db.xxxxx.us-east-1.rds.amazonaws.com`)
3. Your connection string will be:
   ```
   postgresql://flight_user:YOUR_PASSWORD@skyguard-db.xxxxx.us-east-1.rds.amazonaws.com:5432/flight_schedule_db
   ```

### 1.3 Configure Security Group

1. In RDS, click on your database → **Connectivity & security** tab
2. Click on the **VPC security group** link
3. Click **Edit inbound rules**
4. Add rule:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Your EC2 security group (we'll create this next) OR `0.0.0.0/0` for testing (less secure)

---

## Step 2: Set Up Backend Server (EC2)

### 2.1 Create EC2 Instance

1. Go to **AWS Console** → Search for **"EC2"** → Click **"Launch Instance"**

2. Configure:
   - **Name**: `skyguard-backend`
   - **AMI**: Amazon Linux 2023 (or Ubuntu 22.04 LTS)
   - **Instance type**: `t3.micro` (free tier) or `t3.small`
   - **Key pair**: Create new key pair (download the `.pem` file - you'll need it!)
   - **Network settings**: 
     - Click **"Edit"**
     - **Security group**: Create new security group
     - **Name**: `skyguard-backend-sg`
     - **Inbound rules**: Add these:
       - SSH (22) from My IP
       - HTTP (80) from Anywhere (0.0.0.0/0)
       - HTTPS (443) from Anywhere (0.0.0.0/0)
       - Custom TCP (3000) from Anywhere (0.0.0.0/0) - for API access
   - **Storage**: 20 GB

3. Click **"Launch instance"**

### 2.2 Connect to Your EC2 Server

**On Windows:**
1. Open PowerShell or Command Prompt
2. Navigate to where you saved your `.pem` file
3. Run:
   ```powershell
   ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
   ```
   (Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP)

**On Mac/Linux:**
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### 2.3 Install Node.js on EC2

**For Amazon Linux 2023:**
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

**For Ubuntu:**
```bash
# Update system
sudo apt update -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.4 Install PM2 (Process Manager)

PM2 keeps your app running even if you disconnect:
```bash
sudo npm install -g pm2
```

### 2.5 Upload Your Code to EC2

**Option A: Using Git (Recommended)**

```bash
# On EC2
cd ~
git clone YOUR_REPOSITORY_URL
cd SkyGuard-Scheduler/backend
```

**Option B: Using SCP (if not using Git)**

On your local machine:
```bash
# Create a zip of your backend folder
cd SkyGuard-Scheduler
zip -r backend.zip backend/

# Upload to EC2
scp -i your-key.pem backend.zip ec2-user@YOUR_EC2_IP:~/

# On EC2, extract
unzip backend.zip
cd backend
```

### 2.6 Set Up Environment Variables

On EC2:
```bash
cd ~/SkyGuard-Scheduler/backend
nano .env
```

Paste this (replace with your actual values):
```env
NODE_ENV=production
PORT=3000

# Database (use your RDS endpoint)
DATABASE_URL=postgresql://flight_user:YOUR_PASSWORD@skyguard-db.xxxxx.us-east-1.rds.amazonaws.com:5432/flight_schedule_db

# JWT Secret (generate a random string, at least 32 characters)
JWT_SECRET=your-super-secret-key-change-this-to-something-random-and-long
JWT_EXPIRES_IN=24h

# API Keys
OPENWEATHER_API_KEY=your-openweathermap-key
OPENAI_API_KEY=your-openai-key

# Frontend URL (we'll set this after deploying frontend)
FRONTEND_URL=https://your-cloudfront-url.cloudfront.net

# Demo Mode
DEMO_MODE=false
```

Save and exit (Ctrl+X, then Y, then Enter)

### 2.7 Install Dependencies and Build

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build TypeScript
npm run build
```

### 2.8 Run Database Migrations

```bash
# Run migrations
npx prisma migrate deploy

# Seed database (optional - adds test data)
npm run db:seed
```

### 2.9 Start the Application with PM2

```bash
# Start the app
pm2 start dist/index.js --name skyguard-backend

# Make it start on server reboot
pm2 startup
pm2 save

# Check status
pm2 status

# View logs
pm2 logs skyguard-backend
```

### 2.10 Test Your Backend

```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return: {"success":true,"message":"Server is running",...}
```

Your backend is now running! Note your EC2 public IP - you'll need it for the frontend.

---

## Step 3: Deploy Frontend (S3 + CloudFront)

### 3.1 Build Frontend Locally

On your local machine:
```bash
cd frontend

# Create .env.production file
echo "VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:3000/api" > .env.production
# Replace YOUR_EC2_PUBLIC_IP with your actual EC2 IP

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with your static files.

### 3.2 Create S3 Bucket

1. Go to **AWS Console** → **S3** → **Create bucket**

2. Settings:
   - **Bucket name**: `skyguard-scheduler-frontend` (must be unique globally)
   - **Region**: Same as your EC2
   - **Block Public Access**: **Uncheck** (we need public access)
   - Click **Create bucket**

### 3.3 Configure S3 Bucket Policy

1. Go to your bucket → **Permissions** tab
2. Scroll to **Bucket policy** → Click **Edit**
3. Paste this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::skyguard-scheduler-frontend/*"
    }
  ]
}
```
(Replace `skyguard-scheduler-frontend` with your bucket name)

4. Click **Save changes**

### 3.4 Enable Static Website Hosting

1. Go to **Properties** tab
2. Scroll to **Static website hosting** → Click **Edit**
3. Enable static website hosting
4. **Index document**: `index.html`
5. **Error document**: `index.html` (important for React Router)
6. Click **Save changes**

### 3.5 Upload Frontend Files

**Option A: Using AWS Console (Easiest)**

1. Go to your S3 bucket
2. Click **Upload**
3. Click **Add files**
4. Select ALL files from `frontend/dist/` folder
5. Click **Upload**

**Option B: Using AWS CLI**

```bash
# Install AWS CLI first: https://aws.amazon.com/cli/
# Configure: aws configure

# Upload files
aws s3 sync frontend/dist/ s3://skyguard-scheduler-frontend --delete
```

### 3.6 Create CloudFront Distribution

1. Go to **AWS Console** → **CloudFront** → **Create distribution**

2. Settings:
   - **Origin domain**: Select your S3 bucket
   - **Origin access**: Use website endpoint
   - **Viewer protocol policy**: **Redirect HTTP to HTTPS**
   - **Default root object**: `index.html`
   - **Price class**: Use all edge locations (or cheapest for testing)

3. Click **Create distribution**
4. Wait 15-20 minutes for deployment

### 3.7 Configure CloudFront Error Pages

1. Go to your CloudFront distribution → **Error pages** tab
2. Click **Create custom error response**

3. For 403 errors:
   - **HTTP error code**: 403
   - **Response page path**: `/index.html`
   - **HTTP response code**: 200
   - Click **Create**

4. Repeat for 404 errors (same settings)

### 3.8 Update Frontend API URL

After CloudFront is ready:

1. Update `frontend/.env.production`:
   ```env
   VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:3000/api
   ```

2. Rebuild and re-upload:
   ```bash
   npm run build
   aws s3 sync frontend/dist/ s3://skyguard-scheduler-frontend --delete
   ```

3. Invalidate CloudFront cache:
   - Go to CloudFront → Your distribution → **Invalidations** tab
   - Click **Create invalidation**
   - Enter: `/*`
   - Click **Create invalidation**

### 3.9 Update Backend CORS

On your EC2 server:
```bash
# Edit .env file
nano ~/SkyGuard-Scheduler/backend/.env

# Update FRONTEND_URL with your CloudFront URL
FRONTEND_URL=https://d1234567890abc.cloudfront.net

# Restart the app
pm2 restart skyguard-backend
```

---

## Step 4: Test Everything

1. **Test Backend**: 
   - Visit: `http://YOUR_EC2_IP:3000/health`
   - Should see: `{"success":true,...}`

2. **Test Frontend**:
   - Visit your CloudFront URL: `https://d1234567890abc.cloudfront.net`
   - Should see the login page

3. **Test Login**:
   - Use test account: `admin@flightpro.com` / `password123`
   - Should be able to log in and use the app

---

## 🛠️ Useful Commands

### On EC2 Server:

```bash
# View app logs
pm2 logs skyguard-backend

# Restart app
pm2 restart skyguard-backend

# Stop app
pm2 stop skyguard-backend

# Check app status
pm2 status

# View all logs
pm2 logs
```

### Update Your Code:

```bash
# On EC2
cd ~/SkyGuard-Scheduler/backend
git pull  # If using Git
npm install
npm run build
pm2 restart skyguard-backend
```

---

## 🔒 Security Tips

1. **Change default passwords** in production
2. **Use strong JWT_SECRET** (at least 32 random characters)
3. **Restrict security groups** - only allow necessary ports
4. **Use HTTPS** (CloudFront provides this automatically)
5. **Never commit `.env` files** to Git

---

## 💰 Estimated Costs (Free Tier)

- **EC2 t3.micro**: Free for 12 months (750 hours/month)
- **RDS db.t3.micro**: Free for 12 months (750 hours/month)
- **S3**: First 5GB free
- **CloudFront**: First 1TB free
- **Total**: ~$0/month for first year (if within free tier limits)

After free tier: ~$15-30/month

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check logs
pm2 logs skyguard-backend

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000
```

### Can't connect to database:
- Check RDS security group allows EC2 security group
- Verify DATABASE_URL is correct
- Check RDS is publicly accessible

### Frontend shows errors:
- Check browser console (F12)
- Verify API URL in `.env.production`
- Check CORS settings in backend

### Can't SSH to EC2:
- Verify security group allows SSH from your IP
- Check key file permissions: `chmod 400 your-key.pem`
- Verify you're using correct user (ec2-user for Amazon Linux, ubuntu for Ubuntu)

---

## ✅ You're Done!

Your application should now be live on AWS! 

- **Frontend**: `https://your-cloudfront-url.cloudfront.net`
- **Backend API**: `http://your-ec2-ip:3000/api`
- **Health Check**: `http://your-ec2-ip:3000/health`

If you need help, check the logs with `pm2 logs` on your EC2 server.

