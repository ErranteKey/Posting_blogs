from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from utils.helpers import take_screenshot 

class BasePage:
    def __init__(self, driver: WebDriver, base_url: str):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10) # 10 секунд очікування

    def _open_url(self, url: str, step_name: str = "Open URL"):
        """Відкриває URL і робить скріншот."""
        self.driver.get(url)
        take_screenshot(self.driver, step_name)

    def _click_element(self, by_locator: tuple, step_name: str = "Click Element"):
        """Клікає по елементу і робить скріншот."""
        self.wait.until(EC.element_to_be_clickable(by_locator)).click()
        take_screenshot(self.driver, step_name)

    def _input_text(self, by_locator: tuple, text: str, step_name: str = "Input Text"):
        """Вводить текст у поле і робить скріншот."""
        element = self.wait.until(EC.visibility_of_element_located(by_locator))
        element.clear() # Очищаємо поле перед введенням
        element.send_keys(text)
        take_screenshot(self.driver, step_name)

    def _get_current_url(self) -> str:
        """Повертає поточний URL."""
        return self.driver.current_url

    def _assert_url_is(self, expected_url: str, step_name: str = "Assert URL"):
        """Перевіряє, чи поточний URL збігається з очікуваним."""
        self.wait.until(EC.url_to_be(expected_url))
        take_screenshot(self.driver, step_name)
        assert self._get_current_url() == expected_url, \
            f"Expected URL {expected_url}, but got {self._get_current_url()}"

    def _assert_page_contains_text(self, text: str, step_name: str = "Assert Text"):
        """Перевіряє, чи міститься певний текст на сторінці."""
        self.wait.until(EC.presence_of_element_located((By.XPATH, f"//*[contains(text(), '{text}')]")))
        take_screenshot(self.driver, step_name)
        assert text in self.driver.page_source, f"Text '{text}' not found on page."