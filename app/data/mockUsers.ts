interface User {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  password: string;
  profilePic: string;
}

const mockUsers: User[] = [
  {
    firstName: "John",
    lastName: "Paul",
    age: "25-34",
    email: "jp@gmail.com",
    password: "123",
    profilePic: "/images/default-profile.png",
  },
];

export default mockUsers;