/**
 * Contains the AppController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
class AppController {
  static home(request, response) {
    response.status(200).send('Welcome To Recipe Book Api!');
  }
}
    
export default AppController;
