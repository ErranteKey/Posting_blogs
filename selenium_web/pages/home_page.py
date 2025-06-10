from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from utils.helpers import take_screenshot
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as EC

class HomePage(BasePage):
    POSTS_HEADER = (By.XPATH, "//h2[text()='Posts']")
    DASHBOARD_MENU = (By.LINK_TEXT, "Dashboard")
    
    CONGRATS_MESSAGE = (By.XPATH, "//*[contains(text(), 'Congrats!')]")

    def __init__(self, driver, base_url):
        super().__init__(driver, base_url)
        self.url = f"{self.base_url}/"

    def verify_on_dashboard_page(self):
        #Перевіряє, що користувач знаходиться на сторінці 'Dashboard'.
        self.wait.until(EC.visibility_of_element_located(self.POSTS_HEADER))
        self.wait.until(EC.visibility_of_element_located(self.DASHBOARD_MENU))
        take_screenshot(self.driver, "Verify On Dashboard Page")

    def verify_no_login_message(self):
        #Перевіряє, що після успішного входу немає ніяких повідомлень (окрім профілю).
        try:
            self.wait.until(EC.invisibility_of_element_located(self.CONGRATS_MESSAGE))
            take_screenshot(self.driver, "Verify No Congrats Message After Login")
        except TimeoutException:
            print("No 'Congrats!' message found, as expected after login.")
            take_screenshot(self.driver, "Verify No Congrats Message After Login - No Timeout")
        except Exception as e:
            print(f"Unexpected element or error checking for messages after login: {e}")
            raise 

    def verify_registration_congrats_message(self):
        #Перевіряє, що з'являється повідомлення 'Congrats!' після реєстрації.
        self.wait.until(EC.visibility_of_element_located(self.CONGRATS_MESSAGE))
        self._assert_page_contains_text("Congrats!", "Verify Congrats Message After Registration")