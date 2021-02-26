import { check } from "express-validator";
export default [
  check("email").isEmail().withMessage("Недоступный формат почты"),
  check("password")
    .isLength({ min: 5 })
    .withMessage("Должен содержать минимум 5 символов"),
];
