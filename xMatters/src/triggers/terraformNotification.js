if (request.parameters && request.parameters.recipients) {
    output['Recipients'] = request.parameters.recipients;
  }
  
  output['Raw Request'] = request.body;
  var payload;
  try {
    payload = JSON.parse(request.body);
  } catch (err) {
    throw new Error(buildErrorMessage('Payload is not valid JSON.'));
  }
  
  // Check for correct payload structure
  var missing = [];
  if (!payload) {
    throw new Error(buildErrorMessage('Payload is undefined.'));
  }
  if (!hasPropValue(payload, 'notifications')) {
    missing.push('notifications');
  }
  if (missing.length > 0) {
    throw new Error(buildErrorMessage('Payload missing "' + missing.join('", "') + '".'));
  }
  
  // Standard outputs
  switch (payload.notifications[0].trigger) {
  case 'run:created':
  case 'run:planning':
  case 'run:needs_attention':
  case 'run:applying':
    output['Signal Mode'] = 'Alert';
    break;
  case 'run:completed':
    output['Signal Mode'] = 'Clear';
    break;
  case 'run:errored':
      if (payload.notifications[0].run_status == 'discarded'){
          output['Signal Mode'] = 'Clear';
      } else {
         output['Signal Mode'] = 'Alert';
      }
      break;
  case 'verification':
    output['Signal Mode'] = 'Test';
    break;
  default:
    output['Signal Mode'] = 'Do Nothing';
    break;
  }
  output['Signal ID'] = payload.run_id;
  
  // Application outputs
  output['Notification Trigger'] = payload.notifications[0].trigger;
  output['Notification Message'] = payload.notifications[0].message;
  output['Run ID'] = payload.run_id;
  output['Run URL'] = payload.run_url;
  output['Run Message'] = payload.run_message;
  output['Run Created'] = payload.run_created_at;
  output['Run Created By'] = payload.run_created_by;
  output['Run Status'] = payload.notifications[0].run_status;
  output['Run Updated At'] = payload.notifications[0].run_updated_at;
  output['Run Updated By'] = payload.notifications[0].run_updated_by;
  output['Workspace ID'] = payload.workspace_id;
  output['Workspace Name'] = payload.workspace_name;
  output['Organization Name'] = payload.organization_name;
  
  /**
   * Checks that obj[prop] is a valid value
   * @param  {Object} obj The object to check the property for
   * @param  {string} prop The property to check the value of
   * @return {boolean} True if obj[prop] is valid, False if not
   */
  function hasPropValue(obj, key) {
    return obj[key] === 0
      || (Object.hasOwnProperty.call(obj, key)
      && obj[key] !== null
      && obj[key] !== undefined);
  }
  
  /**
   * Builds a common error message describing the action that failed and why
   * @param  {string} reason The reason why the step is interrupting the flow
   * @return {string}               A common error message that can be thrown
   */
  function buildErrorMessage(reason) {
    return '\nUnable to trigger the flow. ' + reason;
  }
  