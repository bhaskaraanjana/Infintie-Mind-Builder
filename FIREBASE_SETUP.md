# Firebase Email Configuration Guide

This guide explains how to customize the verification emails sent to your users and how to prevent them from landing in the "Spam" folder. These settings are managed in the **Firebase Console**, not in the application code.

## 1. Refining Email Content (Templates)

To change the subject line, sender name, or body text of the emails:

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project ("Infinite Mind").
3.  In the left sidebar, click **Authentication**.
4.  Click the **Templates** tab at the top.
5.  Click on **Email address verification**.
6.  Click the **Edit** (pencil) icon.
    *   **Sender name:** Change this from "noreply" to "Infinite Mind Team".
    *   **Reply-to:** Set this to a real support email (e.g., `support@yourdomain.com`).
    *   **Subject:** Customize the subject line (e.g., "Welcome to Infinite Mind! Verify your email").
    *   **Message:** You can edit the text message. *Note: You must leave the `%LINK%` placeholder intact.*
7.  Click **Save**.

## 2. Preventing Spam (Custom Domain)

By default, emails are sent from `noreply@your-project-id.firebaseapp.com`. Because this is a shared domain, email providers (Gmail, Outlook) often flag it as spam.

To fix this, you need to verify that you own a domain (e.g., `infinitemind.com`):

1.  In the **Templates** tab (where you were above), click the **Custom domain** link (usually near the sender info) or go to **Authentication > Settings > Authorized Domains**.
2.  Actually, the specific setting for *Email Sending* is often under **Hosting** or directly in the Templates edit view where it says "Customize domain".
3.  The most reliable path:
    *   Click the **pencil icon** to edit a template again.
    *   Click **"Customize domain"** next to the Sender address.
    *   Follow the wizard to add your domain (e.g., `your-app.com`).
4.  **DNS Configuration:**
    *   Firebase will give you DNS records (TXT and CNAME).
    *   You must log in to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.) and add these records.
    *   This sets up **SPF** and **DKIM**, which proves to email providers that the email is legitimately coming from you.
5.  Once verified (can take up to 48 hours), your emails will come from `noreply@your-app.com` and will be trusted by email providers, bypassing the Spam folder.

## 3. Verify Changes
After saving changes in the console:
1.  Go back to the Infinite Mind app.
2.  Log in with an unverified account.
3.  Click **"Resend Email"**.
4.  Check your inbox to see the updated branding and verify it is not in spam (if domain is verified).
