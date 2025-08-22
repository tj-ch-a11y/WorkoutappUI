"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Clock, Zap, Target, Heart, Dumbbell, Activity, Grid3X3 } from "lucide-react"

interface WorkoutProgram {
  id: string
  name: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  exercises: string[]
  description: string
  icon: string
  color: string
  estimatedCalories: number
  targetMuscles: string[]
}

const workoutPrograms: WorkoutProgram[] = [
  {
    id: "1",
    name: "Upper Body Blast",
    category: "Strength",
    difficulty: "Intermediate",
    duration: "25 min",
    exercises: ["Push-ups", "Pike Push-ups", "Diamond Push-ups", "Wide Push-ups"],
    description: "Build upper body strength with progressive push-up variations",
    icon: "💪",
    color: "bg-red-500",
    estimatedCalories: 180,
    targetMuscles: ["Chest", "Shoulders", "Triceps"],
  },
  {
    id: "2",
    name: "Lower Body Power",
    category: "Strength",
    difficulty: "Advanced",
    duration: "30 min",
    exercises: ["Squats", "Jump Squats", "Single-leg Squats", "Wall Sits"],
    description: "Strengthen and tone your legs with dynamic squat movements",
    icon: "🦵",
    color: "bg-blue-500",
    estimatedCalories: 220,
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
  },
  {
    id: "3",
    name: "Cardio Kickboxing",
    category: "Cardio",
    difficulty: "Intermediate",
    duration: "20 min",
    exercises: ["Jabs", "Crosses", "Hooks", "Uppercuts"],
    description: "High-intensity boxing workout for cardio and coordination",
    icon: "🥊",
    color: "bg-orange-500",
    estimatedCalories: 250,
    targetMuscles: ["Core", "Arms", "Shoulders"],
  },
  {
    id: "4",
    name: "Core Crusher",
    category: "Core",
    difficulty: "Beginner",
    duration: "15 min",
    exercises: ["Plank", "Side Plank", "Mountain Climbers", "Russian Twists"],
    description: "Strengthen your core with targeted abdominal exercises",
    icon: "🔥",
    color: "bg-purple-500",
    estimatedCalories: 120,
    targetMuscles: ["Abs", "Obliques", "Lower Back"],
  },
  {
    id: "5",
    name: "HIIT Express",
    category: "HIIT",
    difficulty: "Advanced",
    duration: "18 min",
    exercises: ["Burpees", "Jump Squats", "Push-ups", "High Knees"],
    description: "Quick high-intensity interval training for maximum burn",
    icon: "⚡",
    color: "bg-yellow-500",
    estimatedCalories: 280,
    targetMuscles: ["Full Body"],
  },
  {
    id: "6",
    name: "Flexibility Flow",
    category: "Flexibility",
    difficulty: "Beginner",
    duration: "12 min",
    exercises: ["Arm Circles", "Leg Swings", "Torso Twists", "Neck Rolls"],
    description: "Improve flexibility and mobility with gentle movements",
    icon: "🧘",
    color: "bg-green-500",
    estimatedCalories: 60,
    targetMuscles: ["Full Body"],
  },
  {
    id: "7",
    name: "Beginner Basics",
    category: "Beginner",
    difficulty: "Beginner",
    duration: "20 min",
    exercises: ["Wall Push-ups", "Chair Squats", "Standing Marches", "Arm Raises"],
    description: "Perfect starting point for fitness beginners",
    icon: "🌟",
    color: "bg-cyan-500",
    estimatedCalories: 100,
    targetMuscles: ["Full Body"],
  },
  {
    id: "8",
    name: "Athletic Performance",
    category: "Sports",
    difficulty: "Advanced",
    duration: "35 min",
    exercises: ["Plyometric Push-ups", "Single-leg Squats", "Speed Punches", "Agility Drills"],
    description: "Sport-specific training for enhanced athletic performance",
    icon: "🏃",
    color: "bg-indigo-500",
    estimatedCalories: 320,
    targetMuscles: ["Full Body", "Power", "Agility"],
  },
]

const categories = [
  { name: "All", icon: Grid3X3, count: workoutPrograms.length },
  { name: "Strength", icon: Dumbbell, count: workoutPrograms.filter((w) => w.category === "Strength").length },
  { name: "Cardio", icon: Heart, count: workoutPrograms.filter((w) => w.category === "Cardio").length },
  { name: "HIIT", icon: Zap, count: workoutPrograms.filter((w) => w.category === "HIIT").length },
  { name: "Core", icon: Target, count: workoutPrograms.filter((w) => w.category === "Core").length },
  { name: "Flexibility", icon: Activity, count: workoutPrograms.filter((w) => w.category === "Flexibility").length },
  { name: "Beginner", icon: Target, count: workoutPrograms.filter((w) => w.category === "Beginner").length },
  { name: "Sports", icon: Activity, count: workoutPrograms.filter((w) => w.category === "Sports").length },
]

export function CategoriesTab() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredWorkouts = workoutPrograms.filter((workout) => {
    const matchesCategory = selectedCategory === "All" || workout.category === selectedCategory
    const matchesDifficulty = !selectedDifficulty || workout.difficulty === selectedDifficulty
    const matchesSearch =
      workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesDifficulty && matchesSearch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500"
      case "Intermediate":
        return "bg-yellow-500"
      case "Advanced":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="px-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Workout Categories</h2>
        <p className="text-gray-400">Choose from our curated workout programs</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className={`whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
                <Badge variant="secondary" className="ml-1 bg-gray-600 text-xs">
                  {category.count}
                </Badge>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Difficulty Level:</span>
        </div>
        <div className="flex gap-2">
          {["Beginner", "Intermediate", "Advanced"].map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
              className={`${
                selectedDifficulty === difficulty
                  ? `${getDifficultyColor(difficulty)} hover:opacity-80`
                  : "border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              }`}
            >
              {difficulty}
            </Button>
          ))}
        </div>
      </div>

      {/* Workout Programs Grid */}
      <div className="space-y-4">
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition-colors">
            <div className="flex items-start gap-4">
              {/* Workout Icon */}
              <div
                className={`w-16 h-16 ${workout.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
              >
                {workout.icon}
              </div>

              {/* Workout Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{workout.name}</h3>
                    <p className="text-gray-400 text-sm">{workout.description}</p>
                  </div>
                  <Badge className={`${getDifficultyColor(workout.difficulty)} text-white text-xs`}>
                    {workout.difficulty}
                  </Badge>
                </div>

                {/* Workout Stats */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {workout.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    {workout.estimatedCalories} cal
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {workout.exercises.length} exercises
                  </div>
                </div>

                {/* Target Muscles */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {workout.targetMuscles.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="bg-gray-700 text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>

                {/* Exercise List */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Exercises:</p>
                  <p className="text-sm text-gray-300">{workout.exercises.join(" • ")}</p>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Workout</Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredWorkouts.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 p-8">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No workouts found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{workoutPrograms.length}</p>
            <p className="text-gray-400 text-sm">Total Programs</p>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">{categories.length - 1}</p>
            <p className="text-gray-400 text-sm">Categories</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
