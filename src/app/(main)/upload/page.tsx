'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, AlertCircle, Loader2, Phone } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [university, setUniversity] = useState('UDSM');
  const [phone, setPhone] = useState(''); // ✅ Ongeza hii
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'uploading' | 'success' | 'error', message: string }>({
    type: 'idle',
    message: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: 'idle', message: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a video file' });
      return;
    }

    if (!title.trim()) {
      setStatus({ type: 'error', message: 'Please enter a video title' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'uploading', message: 'Uploading video... Please wait.' });

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title.trim());
    formData.append('description', description.trim() || '');
    formData.append('price', price || '0');
    formData.append('location', location.trim() || '');
    formData.append('university', university);
    formData.append('phone', phone.trim() || ''); // ✅ Ongeza hii

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setStatus({ type: 'error', message: 'Please login first' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/videos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: '✅ Video uploaded successfully! Redirecting to videos...' });
        setFile(null);
        setTitle('');
        setDescription('');
        setPrice('');
        setLocation('');
        setPhone('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => router.push('/videos'), 2000);
      } else {
        setStatus({ type: 'error', message: data.message || `Upload failed (Status: ${response.status})` });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error - please check if backend is running' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold mb-2">Upload Video</h1>
      <p className="text-gray-500 mb-6">Showcase your property to students using video</p>

      {/* Status Display */}
      {status.type !== 'idle' && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
          status.type === 'uploading' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {status.type === 'uploading' && <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />}
          {status.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          {status.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Video File *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="cursor-pointer block">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click to select a video</p>
              <p className="text-sm text-gray-400">MP4, MOV, AVI • Max 100MB</p>
            </label>
            {file && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Video Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the property (amenities, price, features etc.)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Price & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Price (TSh)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mlimani"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* University */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">University</label>
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UDSM">University of Dar es Salaam (UDSM)</option>
            <option value="ARU">Ardhi University (ARU)</option>
            <option value="MUHAS">Muhimbili University (MUHAS)</option>
            <option value="DIT">Dar Institute of Technology (DIT)</option>
            <option value="CBE">College of Business Education (CBE)</option>
            <option value="IFM">Institute of Finance Management (IFM)</option>
            <option value="DUCE">Dar es Salaam Univ College of Education (DUCE)</option>
            <option value="TIA">Tanzania Institute of Accountancy (TIA)</option>
            <option value="NIT">National Institute of Transport (NIT)</option>
            <option value="OUT">Open University of Tanzania (OUT)</option>
            <option value="SJUIT">St Joseph University Tanzania (SJUIT)</option>
            <option value="KIU">Kampala International University Dar (KIU)</option>
            <option value="MNMA">Mwalimu Nyerere Memorial Academy (MNMA)</option>
            <option value="UoB">University of Bagamoyo Dar Campus (UoB)</option>
            <option value="BOTH">All Universities</option>
          </select>
        </div>

        {/* ✅ WhatsApp Number - New Field */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            <Phone className="inline w-4 h-4 mr-1 text-green-500" />
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0712345678"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Students will contact you via WhatsApp</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium transition ${
            loading 
              ? 'bg-blue-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </span>
          ) : (
            'Upload Video'
          )}
        </button>
      </form>

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-100">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">📹 Tips for Great Videos</h4>
        <ul className="text-blue-700 text-xs space-y-1">
          <li>• Short videos (30-60 seconds) work best</li>
          <li>• Show all rooms and available amenities</li>
          <li>• Make sure lighting is adequate</li>
          <li>• Mention price and location in description</li>
          <li>• Video should not exceed 100MB</li>
        </ul>
      </div>
    </div>
  );
}