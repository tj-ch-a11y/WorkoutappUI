"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Target, Flame } from "lucide-react"
import { useWorkoutStorage } from "@/hooks/use-workout-storage"

export function ProgressTab() {
  const { dailyStats, getWeeklyProgress, getTodayStats, workoutHistory } = useWorkoutStorage()

  const weeklyProgress = getWeeklyProgress()
  const todayStats = getTodayStats()

  const last7Days = dailyStats.slice(0, 7).reverse()
  const maxReps = Math.max(...last7Days.map((day) => day.totalReps), 1)

  return (
    <div className="px-4 pb-20">
      {/* Today's Stats */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Today's Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats.totalReps}</p>
                <p className="text-gray-400 text-sm">Total Reps</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats.calories}</p>
                <p className="text-gray-400 text-sm">Calories</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Overview</h3>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{weeklyProgress.totalWorkouts}</p>
              <p className="text-gray-400 text-sm">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{weeklyProgress.totalReps}</p>
              <p className="text-gray-400 text-sm">Total Reps</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{Math.round(weeklyProgress.totalDuration / 60)}m</p>
              <p className="text-gray-400 text-sm">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{weeklyProgress.avgFormScore}%</p>
              <p className="text-gray-400 text-sm">Avg Form</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">7-Day Activity</h3>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-end justify-between h-32 gap-2">
            {last7Days.map((day, index) => {
              const height = (day.totalReps / maxReps) * 100
              const date = new Date(day.date)
              const dayName = date.toLocaleDateString("en", { weekday: "short" })

              return (
                <div key={day.date} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-700 rounded-t-sm relative" style={{ height: "80px" }}>
                    <div
                      className="bg-purple-500 rounded-t-sm absolute bottom-0 w-full transition-all duration-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{dayName}</p>
                  <p className="text-xs font-semibold">{day.totalReps}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Workouts</h3>
          <Button variant="ghost" className="text-purple-400 text-sm">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {workoutHistory.slice(0, 5).map((workout) => {
            const date = new Date(workout.date)
            const timeAgo = getTimeAgo(date)

            return (
              <Card key={workout.id} className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {workout.exerciseType === "Push-ups" ? "💪" : workout.exerciseType === "Squats" ? "🦵" : "🥊"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{workout.exerciseType}</h4>
                      <p className="text-gray-400 text-sm">
                        {workout.count} reps • {workout.formScore}% form • {workout.calories} cal
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{timeAgo}</p>
                    <p className="text-xs text-gray-500">{Math.round(workout.duration / 60)}m</p>
                  </div>
                </div>
              </Card>
            )
          })}

          {workoutHistory.length === 0 && (
            <Card className="bg-gray-800 border-gray-700 p-8">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No workouts yet</p>
                <p className="text-gray-500 text-sm">Start tracking to see your progress here</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Goals Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Goals</h3>
        <div className="space-y-3">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Daily Push-ups</h4>
                <p className="text-gray-400 text-sm">Target: 50 reps</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-400">{todayStats.totalReps}/50</p>
                <div className="w-20 h-2 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((todayStats.totalReps / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Weekly Workouts</h4>
                <p className="text-gray-400 text-sm">Target: 5 sessions</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-cyan-400">{weeklyProgress.totalWorkouts}/5</p>
                <div className="w-20 h-2 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-2 bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((weeklyProgress.totalWorkouts / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString()
}
