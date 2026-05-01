# Nginx Configuration

## 4you-store.conf

This nginx config fixes the **Cloudflare Redirect Loop** issue.

### Problem
When Cloudflare is in **Flexible SSL** mode:
- Cloudflare receives HTTPS from user
- Cloudflare connects to origin server on **HTTP port 80**
- Old nginx config on port 80 returned 301 redirect to https://
- This caused an infinite redirect loop (ERR_TOO_MANY_REDIRECTS)

### Fix Applied
- Port 80 now proxies directly to the Node.js app (port 3000)
- Sets  so the app knows the original request was HTTPS
- Port 443 continues to work normally with SSL certificates

### Deploy
```bash
cp nginx/4you-store.conf /etc/nginx/conf.d/4you-store.conf
nginx -t && nginx -s reload
```
