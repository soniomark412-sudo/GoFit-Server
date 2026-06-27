// Helper to calculate reward points based on achievements
const achievements = [
  { label: '10 Push-ups', value: 10, points: 10, type: 'pushup', series: 'pushup' },
  { label: '50 Push-ups', value: 50, points: 30, type: 'pushup', series: 'pushup' },
  { label: '100 Push-ups', value: 100, points: 60, type: 'pushup', series: 'pushup' },
  { label: '200 Push-ups', value: 200, points: 120, type: 'pushup', series: 'pushup' },
  { label: '500 Push-ups', value: 500, points: 300, type: 'pushup', series: 'pushup' },
  { label: '1000 Push-ups', value: 1000, points: 700, type: 'pushup', series: 'pushup' },
  { label: 'Push-up every week (4 weeks streak)', value: 'weekly', points: 200, type: 'streak', series: 'weekly' },
  { label: 'Push-up every week (12 weeks streak)', value: 'weekly12', points: 600, type: 'streak', series: 'weekly' },
  { label: 'First Workout', value: 'first', points: 5, type: 'misc' },
  { label: '30 Day Streak', value: 'streak30', points: 500, type: 'streak' },
  { label: 'Push-up Master', value: 'master', points: 1000, type: 'misc' },
];

export function getUserRewardPoints(user) {
  const totalPushups = user.totalPushups || 0;
  const pushupWeeklyStreak = user.pushupWeeklyStreak || 0;
  const userAchievements = user.achievements || [];
  let points = 0;
  achievements.forEach(ach => {
    let achieved = false;
    if (ach.type === 'pushup' && typeof ach.value === 'number') {
      achieved = totalPushups >= ach.value;
    } else if (ach.type === 'streak' && ach.value === 'weekly') {
      achieved = pushupWeeklyStreak >= 4;
    } else if (ach.type === 'streak' && ach.value === 'weekly12') {
      achieved = pushupWeeklyStreak >= 12;
    } else {
      achieved = userAchievements.includes(ach.label);
    }
    if (achieved) points += ach.points;
  });
  return points;
}

const mockUsers = [
  {
    id: 1,
    username: "FitnessPro",
    email: "fitnesspro@example.com",
    password: "password123",
    age: 28,
    height: 180,
    weight: 75,
    fitnessLevel: "advanced",
    profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
    gender: "male",
    bio: "Passionate about fitness and always pushing limits.",
    achievements: ["First Workout"],
    totalWorkouts: 1,
    totalPushups: 10,
    pushupWeeklyStreak: 0
  },
  {
    id: 2,
    username: "GymWarrior",
    email: "gymwarrior@example.com",
    password: "securepass",
    age: 32,
    height: 165,
    weight: 60,
    fitnessLevel: "intermediate",
    profilePicture: "https://randomuser.me/api/portraits/women/2.jpg",
    rewardPoints: 1800,
    gender: "female",
    bio: "Loves group workouts and cardio challenges.",
    achievements: ["10 Day Streak", "Cardio King"],
    totalWorkouts: 32
  },
  {
    id: 3,
    username: "YogaMaster",
    email: "yogamaster@example.com",
    password: "yogapass",
    age: 40,
    height: 170,
    weight: 65,
    fitnessLevel: "advanced",
    profilePicture: "https://randomuser.me/api/portraits/women/3.jpg",
    rewardPoints: 3200,
    gender: "female",
    bio: "Yoga enthusiast and meditation guru.",
    achievements: ["50 Day Streak", "Flexibility Pro", "Meditation Guru"],
    totalWorkouts: 78
  },
  {
    id: 4,
    username: "CrossFitChamp",
    email: "crossfitchamp@example.com",
    password: "crossfit123",
    age: 26,
    height: 175,
    weight: 80,
    fitnessLevel: "intermediate",
    profilePicture: "https://randomuser.me/api/portraits/men/4.jpg",
    rewardPoints: 1500,
    gender: "male",
    bio: "CrossFit lover and always up for a challenge.",
    achievements: ["5 Day Streak"],
    totalWorkouts: 15
  },
  {
    id: 5,
    username: "FitnessNewbie",
    email: "fitnessnewbie@example.com",
    password: "newbiepass",
    age: 22,
    height: 168,
    weight: 70,
    fitnessLevel: "beginner",
    profilePicture: "https://randomuser.me/api/portraits/men/5.jpg",
    rewardPoints: 500,
    gender: "male",
    bio: "Just started my fitness journey!",
    achievements: ["First Workout"],
    totalWorkouts: 5
  }
];

// Set rewardPoints for user id 1
typeof mockUsers[0] !== 'undefined' && (mockUsers[0].rewardPoints = getUserRewardPoints(mockUsers[0]));

export default mockUsers; 
