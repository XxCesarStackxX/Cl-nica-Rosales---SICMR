// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsSummary from '../components/dashboard/StatsSummary'
import RecentAppointments from '../components/dashboard/RecentAppointments'
import UpcomingSchedule from '../components/dashboard/UpcomingSchedule'
import '../components/dashboard/dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState([])
  const [recent, setRecent] = useState([])
  const [upcoming, setUpcoming] = useState([])

  useEffect(() => {
    // Aquí llamas al API para obtener datos reales
    // Ejemplo:
    // fetch('/api/dashboard')
    //   .then(res => res.json())
    //   .then(data => {
    //     setStats(data.stats)
    //     setRecent(data.recentAppointments)
    //     setUpcoming(data.upcomingSchedule)
    //   })
    //   .catch(err => console.error(err))
  }, [])

  return (
    <div className="dashboard-page">
      {/* Título y saludo */}
      <DashboardHeader />

      {/* Resumen de estadísticas en tarjetas */}
      <StatsSummary stats={stats} />

      <div className="dashboard-lists">
        {/* Últimas citas */}
        <RecentAppointments data={recent} />

        {/* Próximas citas */}
        <UpcomingSchedule data={upcoming} />
      </div>
    </div>
  )
}
