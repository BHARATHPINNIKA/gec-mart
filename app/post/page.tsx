'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function PostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('calculator')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMsg('Please log in first.')
      setLoading(false)
      return
    }

    let image_url: string | null = null
    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage
        .from('listing-images')
        .upload(path, file)

      if (upErr) {
        setMsg('Image upload failed: ' + upErr.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { error } = await supabase.from('listings').insert({
      title,
      description,
      price: Number(price),
      category,
      image_url,
      seller_id: user.id,
      seller_email: user.email,
    })

    if (error) {
      setMsg('Could not save: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition'

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Post a <span className="gradient-text">Listing</span>
        </h1>
        <p className="text-slate-400">Sell your gear in under a minute</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
            Title *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Casio FX-991ES Plus"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            rows={4}
            placeholder="Condition, age, any issues..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
              Price (₹) *
            </label>
            <input
              required
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="calculator">🧮 Calculators</option>
              <option value="drafting">📐 Drafting Tools</option>
              <option value="books">📚 Textbooks</option>
              <option value="lab">⚗️ Lab Equipment</option>
              <option value="electronics">🔌 Electronics</option>
              <option value="components">⚡ Components</option>
              <option value="software">💻 Software</option>
              <option value="stationery">✏️ Stationery</option>
              <option value="safety">🦺 Safety Gear</option>
              <option value="projects">🛠️ Project Kits</option>
              <option value="tools">🔧 Hand Tools</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
            Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-white/5 file:text-white file:font-medium file:cursor-pointer hover:file:bg-white/10 file:transition"
          />
        </div>

        {msg && (
          <div className="text-sm text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2">
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 rounded-xl font-medium transition disabled:opacity-50 shadow-lg shadow-violet-600/30"
        >
          {loading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  )
}