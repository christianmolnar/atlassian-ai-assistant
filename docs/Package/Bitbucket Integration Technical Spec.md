# BitBucket Integration - Technical Design Document

## Overview
This document outlines the technical approach for integrating BitBucket APIs into the Atlassian AI Assistant VS Code extension.

## API Integration Strategy

### Authentication Options
1. **App Passwords** (Recommended for demo)
   - Simple username/password authentication
   - Limited scope permissions
   - Easy to configure

2. **OAuth 2.0** (Production recommended)
   - More secure token-based auth
   - Refresh token support
   - Better user experience

### BitBucket API Endpoints

#### Repository Management
```javascript
// Get user repositories
GET /2.0/repositories/{workspace}

// Get repository details  
GET /2.0/repositories/{workspace}/{repo_slug}

// Get branches
GET /2.0/repositories/{workspace}/{repo_slug}/refs/branches