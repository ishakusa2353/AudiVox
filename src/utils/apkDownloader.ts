/**
 * Direct APK Downloader
 * Downloads the APK directly to the device without opening new tabs or redirecting.
 */
export async function downloadApkDirect(target: 'USER' | 'ADMIN', versionName: string = '1.0.0') {
  const fileName = target === 'USER' ? `audivox-user-v${versionName}.apk` : `audivox-admin-v${versionName}.apk`;
  const fileUrl = `/api/download/apk?target=${target.toLowerCase()}`;

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    
    // Create an object URL with Android Package Archive MIME type
    const apkBlob = new Blob([blob], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(apkBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (err) {
    console.warn('Falling back to direct link download:', err);
    // Direct link click
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}
