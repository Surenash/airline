FROM public.ecr.aws/lambda/python:3.11

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install the specified packages
RUN pip install -r requirements.txt

# Copy all files from the backend directory to the lambda task root
COPY . ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (filename.variable_name)
CMD [ "server.handler" ]
