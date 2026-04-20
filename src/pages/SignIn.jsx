import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Footer from '../components/Footer'

// Mock listings for the preview section — beautiful stock photos + fake but plausible data
const MOCK_LISTINGS = [
  {
    id: 'mock-1',
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    price: '$3,200/mo',
    address: '310 W 85th St, Apt 4C',
    hood: 'Upper West Side',
    beds: '1 bd', baths: '1 ba', sqft: '720 sqft',
    tag: 'For Rent', tagColor: '#f97316',
    comments: [
      { role: 'Past Tenant', roleColor: '#0369a1', roleBg: '#f0f9ff', verified: true, text: "Building is beautiful but management takes 3+ weeks on repair requests. The super is the real MVP." },
      { role: 'Neighbor', roleColor: '#6b21a8', roleBg: '#ede9fe', text: "Incredibly quiet block. The trash pickup on West End gets loud Tuesday mornings though." },
    ],
    commentCount: 7, likes: 23,
  },
  {
    id: 'mock-2',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    price: '$875,000',
    address: '57 Driggs Ave, Unit 2R',
    hood: 'Williamsburg',
    beds: '2 bd', baths: '2 ba', sqft: '1,100 sqft',
    tag: 'For Sale', tagColor: '#1a6cf5',
    comments: [
      { role: 'Current Tenant', roleColor: '#92400e', roleBg: '#fef3c7', verified: true, text: "Lived here 3 years. Walls are paper thin — you will hear everything. Price reflects that, honestly." },
      { role: 'Local', roleColor: '#475569', roleBg: '#f1f5f9', text: "Ten minutes to the L train but the walk after midnight isn't great." },
    ],
    commentCount: 12, likes: 41,
  },
  {
    id: 'mock-3',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    price: '$2,400/mo',
    address: '142 Clifton Ave',
    hood: 'Jersey City',
    beds: '1 bd', baths: '1 ba', sqft: '680 sqft',
    tag: 'For Rent', tagColor: '#f97316',
    comments: [
      { role: 'Past Tenant', roleColor: '#0369a1', roleBg: '#f0f9ff', verified: true, text: "Lease renewed 3 times — this is one of the honest landlords left in JC. Heat works. Hot water works. Rare in 2026." },
    ],
    commentCount: 5, likes: 19,
  },
]

export default function SignIn() {
  const { signIn
