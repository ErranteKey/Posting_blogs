from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from utils.helpers import take_screenshot

class LoginPage(BasePage):
    # Локатори елементів
    USERNAME_FIELD = (By.ID, "username")
    EMAIL_FIELD = (By.ID, "email")
    PASSWORD_FIELD = (By.ID, "password")
    CONFIRM_PASSWORD_FIELD = (By.ID, "confirm")
    LOGIN_BUTTON = (By.ID, "login")
    REGISTER_BUTTON = (By.ID, "register")
    OR_SIGN_UP_LINK = (By.LINK_TEXT, "Or Sign Up")

    def __init__(self, driver, base_url):
        super().__init__(driver, base_url)
        self.url = f"{self.base_url}/login"

    def go_to_login_page(self):
        """Відкриває сторінку логіну."""
        self._open_url(self.url, "Go To Login Page")

    def click_sign_up_link(self):
        """Клікає по посиланню 'Or Sign Up' для переходу на реєстрацію."""
        self._click_element(self.OR_SIGN_UP_LINK, "Click 'Or Sign Up' Link")

    def register_user(self, username, email, password, confirm_password):
        """Виконує повний цикл реєстрації."""
        self._input_text(self.USERNAME_FIELD, username, f"Enter Username: {username}")
        self._input_text(self.EMAIL_FIELD, email, f"Enter Email: {email}")
        self._input_text(self.PASSWORD_FIELD, password, "Enter Password")
        self._input_text(self.CONFIRM_PASSWORD_FIELD, confirm_password, "Confirm Password")
        self._click_element(self.REGISTER_BUTTON, "Click Register Button")

    def login_user(self, username, password):
        """Виконує вхід користувача."""
        self._input_text(self.USERNAME_FIELD, username, f"Enter Login Username: {username}")
        self._input_text(self.PASSWORD_FIELD, password, "Enter Login Password")
        self._click_element(self.LOGIN_BUTTON, "Click Login Button")