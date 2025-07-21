export const uploadToCloudinary = async (image) => {
  const cloudName = 'dx1libiis'; // your Cloudinary cloud name
  const presetName = 'socialMediaApp'; // your unsigned preset
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', {
    uri: image.uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  formData.append('upload_preset', presetName);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (data.secure_url) {
     // console.log('✅ Cloudinary Upload Success:', data.secure_url);
      return data.secure_url;
    } else {
      console.error('❌ Cloudinary Upload Failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Upload Error:', error);
    return null;
  }
};
