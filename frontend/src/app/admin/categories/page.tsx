'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layers, 
  Settings, 
  Upload, 
  Save, 
  X, 
  Edit, 
  Trash2,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ManageCategoriesPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', imageUrl: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryImage, setEditingCategoryImage] = useState('');
  
  // Checking auth
  useEffect(() => {
    const auth = localStorage.getItem('skyo_admin_auth');
    if (auth !== 'true') {
      router.push('/admin');
    } else {
      fetchCategories();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('skyo_admin_auth');
        localStorage.removeItem('skyo_admin_token');
        router.push('/admin');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Only JPEG, JPG, and PNG formats are accepted.');
      e.target.value = '';
      return;
    }

    if (file.size > 50 * 1024) {
      alert('Image size exceeds 50KB limit. Please upload a smaller image.');
      e.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_URL}/categories/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: formData
      });
      if (res.status === 401) { localStorage.removeItem('skyo_admin_auth'); localStorage.removeItem('skyo_admin_token'); router.push('/admin'); return; }
      
      if (res.ok) {
        const data = await res.json();
        setNewCategory({...newCategory, imageUrl: data.imageUrl});
      } else {
        alert('Failed to upload image.');
      }
    } catch (error) {
      console.error(error);
      alert('Error compressing or uploading image.');
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Only JPEG, JPG, and PNG formats are accepted.');
      e.target.value = '';
      return;
    }

    if (file.size > 50 * 1024) {
      alert('Image size exceeds 50KB limit. Please upload a smaller image.');
      e.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_URL}/categories/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: formData
      });
      if (res.status === 401) { localStorage.removeItem('skyo_admin_auth'); localStorage.removeItem('skyo_admin_token'); router.push('/admin'); return; }
      
      if (res.ok) {
        const data = await res.json();
        setEditingCategoryImage(data.imageUrl);
      } else {
        alert('Failed to upload image.');
      }
    } catch (error) {
      console.error(error);
      alert('Error compressing or uploading image.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return alert('Please enter a category name');
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify(newCategory)
      });
      if (res.status === 401) { localStorage.removeItem('skyo_admin_auth'); localStorage.removeItem('skyo_admin_token'); router.push('/admin'); return; }
      if (res.ok) {
        alert('Category Created successfully!');
        setNewCategory({ name: '', imageUrl: '' });
        fetchCategories();
      } else {
        const text = await res.text();
        alert(`Failed to create category! Error: ${text}`);
      }
    } catch (err) { 
      console.error(err); 
      alert('Failed to connect to backend.');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ name: editingCategoryName, imageUrl: editingCategoryImage })
      });
      if (res.status === 401) { localStorage.removeItem('skyo_admin_auth'); localStorage.removeItem('skyo_admin_token'); router.push('/admin'); return; }
      if (res.ok) {
        alert('Category Updated successfully!');
        setEditingCategoryId(null);
        fetchCategories();
      } else {
        const text = await res.text();
        alert(`Failed to update category! Error: ${text}`);
      }
    } catch (err) { 
      console.error(err); 
      alert('Failed to connect to backend.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? All jobs within this category will ALSO be deleted permanently!")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` }
      });
      if (res.status === 401) { localStorage.removeItem('skyo_admin_auth'); localStorage.removeItem('skyo_admin_token'); router.push('/admin'); return; }
      if (res.ok) {
        alert('Category and associated jobs deleted successfully!');
        fetchCategories();
      } else {
        const text = await res.text();
        alert(`Failed to delete category! Error: ${text}`);
      }
    } catch (err) { 
      console.error(err); 
      alert('Failed to connect to backend.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin?tab=jobs" className="flex items-center text-sky-800 hover:text-sky-600 font-medium">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Jobs
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-6 md:p-8 bg-sky-900 text-white">
            <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
              <Layers className="h-6 w-6 text-sky-400" /> 
              Manage Categories
            </h1>
            <p className="text-sky-100 text-sm">Add, edit, and organize job categories.</p>
          </div>

          <div className="p-6 md:p-8">
            <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100 mb-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers className="h-5 w-5 text-purple-500" /> Add New Category</h3>
              <form onSubmit={handleCreateCategory} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end mb-8">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category Name</label>
                  <input type="text" required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full border border-purple-200 p-2.5 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white text-slate-900" placeholder="e.g. Sales" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Upload Image (Max 50KB, JPG/PNG)</label>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png"
                    required={!newCategory.imageUrl}
                    onChange={handleImageUpload} 
                    className="w-full border border-purple-200 p-1.5 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer text-slate-900" 
                  />
                </div>
                <button type="submit" className="bg-purple-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-purple-700 h-[46px] shadow-sm w-full md:w-auto">Add Category</button>
              </form>
              
              <h3 className="font-bold text-slate-800 mb-4 border-t border-purple-100 pt-6 flex items-center gap-2"><Settings className="h-5 w-5 text-purple-500" /> Existing Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                    {editingCategoryId === cat.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        {editingCategoryImage && <img src={editingCategoryImage} alt="preview" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-purple-200" />}
                        <input 
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleEditImageUpload}
                          className="hidden"
                          id={`edit-cat-img-${cat.id}`}
                        />
                        <label htmlFor={`edit-cat-img-${cat.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md cursor-pointer shrink-0 font-bold text-xs" title="Change Image">
                          <Upload className="w-3.5 h-3.5" /> Upload Image
                        </label>
                        <input 
                          type="text" 
                          value={editingCategoryName} 
                          onChange={e => setEditingCategoryName(e.target.value)} 
                          className="flex-1 w-20 border border-purple-300 p-1.5 rounded-md outline-none focus:border-purple-500 text-sm font-bold text-slate-900" 
                          autoFocus 
                        />
                        <button onClick={() => handleUpdateCategory(cat.id)} className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md shrink-0">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingCategoryId(null)} className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 overflow-hidden">
                          {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />}
                          <div className="truncate">
                            <p className="font-bold text-sm text-slate-800 truncate">{cat.name}</p>
                            <p className="text-xs font-medium text-slate-500">{cat.jobCount || 0} active jobs</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategoryImage(cat.imageUrl || ''); }} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-md transition-colors" title="Edit Category">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete Category">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
