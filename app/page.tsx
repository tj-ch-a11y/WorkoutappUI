"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Settings, Home, BarChart3, Grid3X3, User, Camera, X, Play, Square, Target } from "lucide-react"
import { ProgressTab } from "@/components/progress-tab"
import { CategoriesTab } from "@/components/categories-tab"
import { GoalManager } from "@/components/goal-manager"
import { useWorkoutStorage } from "@/hooks/use-workout-storage"

export default function FitnessApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [cameraActive, setCameraActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState("Push-ups")
  const [exerciseData, setExerciseData] = useState({
    count: 0,
    form_score: 0,
    state: "ready",
  })
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { saveWorkout, getTodayStats, getAllGoalsProgress } = useWorkoutStorage()
  const todayStats = getTodayStats()
  const goalsProgress = getAllGoalsProgress()

  const progressData = [
    {
      name: "Today",
      current: todayStats.totalReps,
      total: 50,
      duration: `${Math.round(todayStats.totalDuration / 60)}m`,
      percentage: Math.min((todayStats.totalReps / 50) * 100, 100),
    },
    {
      name: "Calories",
      current: todayStats.calories,
      total: 200,
      duration: `${todayStats.totalWorkouts} sessions`,
      percentage: Math.min((todayStats.calories / 200) * 100, 100),
    },
  ]

  const categories = ["All", "Strength", "Cardio", "HIIT", "Core", "Flexibility"]
  const [activeCategory, setActiveCategory] = useState("All")

  const workouts = [
    { name: "Upper Body Blast", difficulty: "Intermediate", duration: "25 min", icon: "💪", category: "Strength" },
    { name: "Lower Body Power", difficulty: "Advanced", duration: "30 min", icon: "🦵", category: "Strength" },
    { name: "Cardio Kickboxing", difficulty: "Intermediate", duration: "20 min", icon: "🥊", category: "Cardio" },
    { name: "Core Crusher", difficulty: "Beginner", duration: "15 min", icon: "🔥", category: "Core" },
    { name: "HIIT Express", difficulty: "Advanced", duration: "18 min", icon: "⚡", category: "HIIT" },
    { name: "Flexibility Flow", difficulty: "Beginner", duration: "12 min", icon: "🧘", category: "Flexibility" },
  ]

  const filteredWorkouts =
    activeCategory === "All" ? workouts : workouts.filter((workout) => workout.category === activeCategory)

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isRecording) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const video = videoRef.current

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      try {
        const response = await fetch("/api/process-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData,
            exerciseType: selectedExercise,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setExerciseData(result)
        }
      } catch (error) {
        console.error("Frame processing error:", error)
      }
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(processFrame, 500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, selectedExercise])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setHasPermission(true)
      setCameraActive(true)
    } catch (err) {
      console.error("Camera access error:", err)
      setError("Camera access denied. Please allow camera permissions.")
      setHasPermission(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
    setIsRecording(false)

    if (workoutStartTime && exerciseData.count > 0) {
      const duration = Date.now() - workoutStartTime
      const calories = calculateCalories(selectedExercise, exerciseData.count, duration)

      saveWorkout({
        date: new Date().toISOString(),
        exerciseType: selectedExercise,
        count: exerciseData.count,
        duration: duration,
        formScore: exerciseData.form_score,
        calories: calories,
      })
    }

    setExerciseData({ count: 0, form_score: 0, state: "ready" })
    setWorkoutStartTime(null)
  }

  const toggleRecording = () => {
    if (!isRecording) {
      setWorkoutStartTime(Date.now())
      setExerciseData({ count: 0, form_score: 0, state: "ready" })
    }
    setIsRecording(!isRecording)
  }

  const calculateCalories = (exerciseType: string, count: number, duration: number): number => {
    const caloriesPerRep = {
      "Push-ups": 0.5,
      Squats: 0.4,
      Punches: 0.3,
    }

    const baseCalories = count * (caloriesPerRep[exerciseType as keyof typeof caloriesPerRep] || 0.4)
    const durationBonus = (duration / 1000 / 60) * 2 // 2 calories per minute

    return Math.round(baseCalories + durationBonus)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handleTrackWorkout = () => {
    startCamera()
  }

  const renderContent = () => {
    if (activeTab === "progress") {
      return <ProgressTab />
    }

    if (activeTab === "categories") {
      return <CategoriesTab />
    }

    if (activeTab === "goals") {
      return (
        <div className="px-4 pb-20">
          <GoalManager />
        </div>
      )
    }

    return (
      <div className="px-4 pb-20">
        {/* Hero Card */}
        <Card className="bg-gradient-to-r from-purple-600 to-purple-800 border-none mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Start Strong</h2>
              <p className="text-purple-100 mb-4">Set Your Goals</p>
              <Button
                onClick={handleTrackWorkout}
                className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-6"
              >
                <Camera className="h-4 w-4 mr-2" />
                Track
              </Button>
            </div>
            <div className="w-20 h-20 bg-cyan-500 rounded-lg flex items-center justify-center ml-4">
              <span className="text-white text-xs">Camera View</span>
            </div>
          </div>
        </Card>

        {/* Goals Progress Section */}
        {goalsProgress.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Today's Goals
              </h3>
              <Button variant="ghost" className="text-purple-400 text-sm" onClick={() => setActiveTab("goals")}>
                Manage
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {goalsProgress.slice(0, 2).map((progress, index) => (
                <Card key={progress?.goal.id} className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-white font-medium capitalize">{progress?.goal.exerciseType}</div>
                      {progress?.isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    </div>
                    <div className="text-sm text-gray-400">
                      {progress?.currentReps}/{progress?.goal.targetReps}
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress?.isCompleted ? "bg-green-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${progress?.progress}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Progress</h3>
            <Button variant="ghost" className="text-purple-400 text-sm" onClick={() => setActiveTab("progress")}>
              See All
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {progressData.map((item, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 p-4">
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-3">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-600"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={index === 0 ? "text-purple-500" : "text-cyan-500"}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${item.percentage}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {item.current}/{item.total}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold mb-1">{item.name}</h4>
                  <p className="text-gray-400 text-sm">{item.duration}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <Button variant="ghost" className="text-purple-400 text-sm" onClick={() => setActiveTab("categories")}>
              See All
            </Button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap ${
                  activeCategory === category ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredWorkouts.map((workout, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center text-xl">
                      {workout.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{workout.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {workout.difficulty} • {workout.duration}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <span className="text-lg">›</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-8">
        <h1 className="text-2xl font-bold">SkillGen</h1>
        <Button variant="ghost" size="icon" className="text-white">
          <Settings className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-around py-2">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "progress", icon: BarChart3, label: "Progress" },
            { id: "categories", icon: Grid3X3, label: "Categories" },
            { id: "goals", icon: Target, label: "Goals" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 ${
                activeTab === tab.id ? "text-purple-400" : "text-gray-400"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Camera Modal */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
          <div className="flex items-center justify-between p-4 bg-gray-800">
            <h3 className="text-lg font-semibold">Exercise Tracking</h3>
            <Button onClick={stopCamera} variant="ghost" size="icon" className="text-white hover:bg-gray-700">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            {error ? (
              <div className="text-center">
                <div className="w-64 h-48 bg-red-900/20 border border-red-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-red-400 text-sm px-4">{error}</span>
                </div>
                <Button onClick={startCamera} className="bg-purple-600 hover:bg-purple-700">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md h-auto rounded-lg bg-gray-800"
                  style={{ transform: "scaleX(-1)" }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Recording</span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-white text-sm mb-2">
                      {isRecording ? `Tracking ${selectedExercise}` : "Ready to track your workout"}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-300">
                      <span className="font-semibold">
                        {selectedExercise}: {exerciseData.count}
                      </span>
                      <span>•</span>
                      <span>Form Score: {exerciseData.form_score}%</span>
                      <span>•</span>
                      <span>State: {exerciseData.state}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-800">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={toggleRecording}
                className={`${
                  isRecording ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                } px-8 py-3`}
                disabled={!!error}
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5 mr-2" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start Tracking
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4">
              <p className="text-center text-sm text-gray-400 mb-2">Select Exercise Type:</p>
              <div className="flex gap-2 justify-center">
                {["Push-ups", "Squats", "Punches"].map((exercise) => (
                  <Button
                    key={exercise}
                    variant={selectedExercise === exercise ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedExercise(exercise)}
                    className={`${
                      selectedExercise === exercise
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    }`}
                  >
                    {exercise}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
