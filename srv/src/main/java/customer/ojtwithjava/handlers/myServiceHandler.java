package customer.ojtwithjava.handlers;

import com.sap.cds.services.handler.annotations.On;

import java.util.Collection;
import java.util.Map;
import com.sap.cds.Result;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.sap.cds.services.EventContext;
import com.sap.cds.ql.Select;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;
import cds.gen.myservice.MyService_;
import cds.gen.myservice.Roles_;
import cds.gen.myservice.Employees_;
import cds.gen.myservice.Employees;
import cds.gen.myservice.CalEmpSalaryContext;
import cds.gen.myservice.WhoamiContext;
import com.sap.cds.services.cds.CdsCreateEventContext;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.request.UserInfo;

@Component
@ServiceName(MyService_.CDS_NAME)
public class myServiceHandler implements EventHandler {
  @Autowired
  PersistenceService db;
  @Autowired
  UserInfo userInfo;
  private static final Logger logger = LoggerFactory.getLogger(myServiceHandler.class);

  // When post employee
  @On(event = { CqnService.EVENT_CREATE }, entity = Employees_.CDS_NAME)
  public void calSalary(EventContext context) {
    if (context instanceof CdsCreateEventContext) {
      System.out.println(context);
      CdsCreateEventContext createContext = (CdsCreateEventContext) context;
      createContext.getCqn().entries().forEach(this::updateSalary);
    }
  }

  @On(event = { WhoamiContext.CDS_NAME })
  public void whoami(WhoamiContext context) {
    Collection<String> roles = userInfo.getRoles();
    System.out.println(roles);
    for (String role : roles) {
      if ("admin".equals(role)) {
        context.setResult("admin");
      }
    }
  }

  @On
  public void onCalEmpSalary(CalEmpSalaryContext context) {
    Map<String, Object> employData = context.getEmployee();
    LocalDate hireDate = (LocalDate) employData.get("hireDate");
    LocalDate currentDay = LocalDate.now();
    long workYears = 0;
    if (hireDate != null) {
      workYears = ChronoUnit.YEARS.between(hireDate, currentDay);
    }
    if (workYears < 0) {
      workYears = 0;
    }
    BigDecimal baseSalary = BigDecimal.ZERO;
    BigDecimal allowance = BigDecimal.ZERO;
    String roleId = (String) employData.get("role_ID");
    Integer ratingObj = (Integer) employData.get("performanceRating");
    int performanceRating = (ratingObj != null) ? ratingObj : 0;
    System.out.println(roleId);
    try {
      Result roleData = db.run(
          Select.from(Roles_.CDS_NAME)
              .columns("baseSalary", "allowance")
              .where(r -> r.get("ID").eq(roleId)));
      System.out.println(roleData);
      Map<String, Object> row = roleData.first(Map.class).orElse(null);
      if (row != null) {
        Object baseSalaryObj = row.get("baseSalary");
        Object allowanceObj = row.get("allowance");

        if (baseSalaryObj instanceof Number) {
          baseSalary = new BigDecimal(((Number) baseSalaryObj).toString());
        }

        if (allowanceObj instanceof Number) {
          allowance = new BigDecimal(((Number) allowanceObj).toString());
        }
      }
      System.out.println("Base Salary: " + baseSalary);
      System.out.println("Allowance: " + allowance);
    } catch (Exception oError) {
      logger.error("Error when obtain data by  role ID: {}", roleId, oError);
    }
    BigDecimal salary = baseSalary.add(allowance)
        .add(BigDecimal.valueOf(workYears).multiply(BigDecimal.valueOf(1000)))
        .add(BigDecimal.valueOf(performanceRating).multiply(BigDecimal.valueOf(500)));
    System.out.println(salary);
    context.setResult(salary.doubleValue());
  }

  // Get salary before post funtion
  private void updateSalary(Map<String, Object> entry) {
    Object hireDate = entry.get(Employees.HIRE_DATE);
    LocalDate cvHireDate = LocalDate.parse(hireDate.toString());
    Map<String, Object> roleMap = (Map<String, Object>) entry.get("role");
    String roleId = null;
    if (roleMap != null) {
      roleId = (String) roleMap.get("ID");
    }
    String cvRoleId = roleId.toString();
    LocalDate currentDay = LocalDate.now();
    long workYears = ChronoUnit.YEARS.between(cvHireDate, currentDay);
    if (workYears < 0) {
      workYears = 0;
    }
    BigDecimal baseSalary = BigDecimal.ZERO;
    BigDecimal allowance = BigDecimal.ZERO;
    try {
      Result roleData = db.run(
          Select.from(Roles_.CDS_NAME)
              .columns("baseSalary", "allowance")
              .where(r -> r.get("ID").eq(cvRoleId)));
      System.out.println(roleData);
      Map<String, Object> row = roleData.first(Map.class).orElse(null);
      if (row != null) {
        Object baseSalaryObj = row.get("baseSalary");
        Object allowanceObj = row.get("allowance");

        if (baseSalaryObj instanceof Number) {
          baseSalary = new BigDecimal(((Number) baseSalaryObj).toString());
        }

        if (allowanceObj instanceof Number) {
          allowance = new BigDecimal(((Number) allowanceObj).toString());
        }
      }
    } catch (Exception oError) {
      logger.error("Error when obtain data by  role ID: {}", cvRoleId, oError);
    }
    BigDecimal salary = baseSalary.add(allowance)
        .add(BigDecimal.valueOf(workYears).multiply(BigDecimal.valueOf(1000)));
    entry.put(Employees.SALARY, salary);
  }
}
